import { Router, type IRouter, type Request } from "express";

const router: IRouter = Router();

const MAX_TASK_LENGTH = 4_000;
const REQUEST_TIMEOUT_MS = 45_000;
const RATE_WINDOW_MS = 60_000;
const RATE_LIMIT = 12;

type RateEntry = { count: number; resetAt: number };
const rateEntries = new Map<string, RateEntry>();

type OpenAIResponse = {
  status?: string;
  output?: Array<{
    type?: string;
    content?: Array<{
      type?: string;
      text?: string;
      refusal?: string;
    }>;
  }>;
  error?: { message?: string };
};

type TaskResult = {
  title: string;
  summary: string;
  deliverable: string;
  nextSteps: string[];
  riskNote: string;
};

function readString(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed ? trimmed : null;
}

function clientKey(req: Request): string {
  const forwarded = req.headers["x-forwarded-for"];
  if (typeof forwarded === "string") return forwarded.split(",")[0]?.trim() || "unknown";
  return req.ip || req.socket?.remoteAddress || "unknown";
}

function isRateLimited(key: string): boolean {
  const now = Date.now();
  const current = rateEntries.get(key);
  if (!current || current.resetAt <= now) {
    rateEntries.set(key, { count: 1, resetAt: now + RATE_WINDOW_MS });
    return false;
  }

  current.count += 1;
  return current.count > RATE_LIMIT;
}

function extractOutputText(payload: OpenAIResponse): string | null {
  for (const item of payload.output ?? []) {
    for (const content of item.content ?? []) {
      if (content.type === "refusal" && content.refusal) {
        throw new Error("MODEL_REFUSAL");
      }
      if (content.type === "output_text" && content.text) return content.text;
    }
  }
  return null;
}

function parseTaskResult(raw: string): TaskResult {
  const value = JSON.parse(raw) as Partial<TaskResult>;
  if (
    typeof value.title !== "string" ||
    typeof value.summary !== "string" ||
    typeof value.deliverable !== "string" ||
    !Array.isArray(value.nextSteps) ||
    !value.nextSteps.every((item) => typeof item === "string") ||
    typeof value.riskNote !== "string"
  ) {
    throw new Error("INVALID_MODEL_OUTPUT");
  }

  return {
    title: value.title.trim(),
    summary: value.summary.trim(),
    deliverable: value.deliverable.trim(),
    nextSteps: value.nextSteps.map((item) => item.trim()).filter(Boolean).slice(0, 5),
    riskNote: value.riskNote.trim(),
  };
}

router.post("/ai/task", async (req, res) => {
  if (isRateLimited(clientKey(req))) {
    res.status(429).json({ error: "rate_limit", message: "Слишком много запросов. Повторите через минуту." });
    return;
  }

  const task = readString(req.body?.task);
  const companyName = readString(req.body?.companyName) ?? "компания пользователя";
  const playerName = readString(req.body?.playerName) ?? "основатель";

  if (!task || task.length > MAX_TASK_LENGTH) {
    res.status(400).json({
      error: "invalid_task",
      message: `Опишите задачу текстом длиной до ${MAX_TASK_LENGTH} символов.`,
    });
    return;
  }

  const apiKey = process.env["OPENAI_API_KEY"];
  if (!apiKey) {
    res.status(503).json({
      error: "ai_not_configured",
      message: "AI-сервис ещё не настроен на сервере.",
    });
    return;
  }

  const model = process.env["OPENAI_MODEL"] || "gpt-5.6-luna";
  const schema = {
    type: "object",
    properties: {
      title: { type: "string", description: "Короткое название готового результата" },
      summary: { type: "string", description: "Краткий итог в 1-3 предложениях" },
      deliverable: { type: "string", description: "Полный готовый рабочий результат" },
      nextSteps: {
        type: "array",
        description: "До пяти следующих практических шагов",
        items: { type: "string" },
      },
      riskNote: {
        type: "string",
        description: "Краткое предупреждение о существенном риске либо пустая строка",
      },
    },
    required: ["title", "summary", "deliverable", "nextSteps", "riskNote"],
    additionalProperties: false,
  };

  const systemPrompt = [
    "Ты — AI-бизнес-ассистент внутри OfficeOS для владельцев малого бизнеса.",
    "Отвечай на языке задачи. Давай конкретный рабочий результат, который можно сразу использовать или отредактировать.",
    "Не утверждай, что отправил письмо, подписал документ, изменил календарь или выполнил действие во внешней системе.",
    "Если данных не хватает, явно перечисли разумные допущения внутри результата.",
    "Не выдавай категоричные юридические, налоговые, медицинские или инвестиционные гарантии; обозначай необходимость профильной проверки в riskNote.",
  ].join(" ");

  try {
    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        store: false,
        max_output_tokens: 1_500,
        input: [
          { role: "system", content: systemPrompt },
          {
            role: "user",
            content: `Основатель: ${playerName}\nКомпания: ${companyName}\nЗадача: ${task}`,
          },
        ],
        text: {
          format: {
            type: "json_schema",
            name: "officeos_task_result",
            strict: true,
            schema,
          },
        },
      }),
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    });

    const payload = (await response.json()) as OpenAIResponse;
    if (!response.ok) {
      res.status(502).json({
        error: "ai_provider_error",
        message: "AI-сервис временно не обработал задачу.",
      });
      return;
    }

    if (payload.status && payload.status !== "completed") {
      res.status(502).json({
        error: "ai_incomplete",
        message: "AI не успел завершить задачу. Попробуйте ещё раз.",
      });
      return;
    }

    const rawOutput = extractOutputText(payload);
    if (!rawOutput) throw new Error("EMPTY_MODEL_OUTPUT");

    res.json(parseTaskResult(rawOutput));
  } catch (error) {
    if (error instanceof Error && error.message === "MODEL_REFUSAL") {
      res.status(422).json({
        error: "ai_refusal",
        message: "AI не может выполнить эту задачу. Переформулируйте запрос.",
      });
      return;
    }

    res.status(502).json({
      error: "ai_unavailable",
      message: "AI-сервис временно недоступен. Попробуйте позже.",
    });
  }
});

export default router;
