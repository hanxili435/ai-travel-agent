import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    console.log("Incoming body:", body);

    const res = await fetch("https://heidi-ai.app.n8n.cloud/webhook/travel-plan", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    console.log("n8n status:", res.status, res.statusText);

    const text = await res.text();
    console.log("n8n raw response:", text);

    if (!res.ok) {
      return NextResponse.json(
        {
          error: "n8n returned an error",
          status: res.status,
          raw: text,
        },
        { status: 500 }
      );
    }

    let data;
    try {
      data = JSON.parse(text);
    } catch {
      return NextResponse.json(
        {
          error: "n8n did not return valid JSON",
          raw: text,
        },
        { status: 500 }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("API route error:", error);
    return NextResponse.json(
      { error: "Failed to call n8n webhook" },
      { status: 500 }
    );
  }
}