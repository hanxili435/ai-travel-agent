"use client";
import { useState } from "react";

type FormData = {
  origin: string;
  destination: string;
  currency: "USD" | "CNY" | "EUR" | "JPY";
  budget: string;
  start_date: string;
  end_date: string;
  vacation_style: string;
  notes: string;
};

type Payload = {
  origin: string;
  destination: string;
  currency: string;
  budget: number;
  start_date: string;
  end_date: string;
  vacation_style: string;
  notes: string;
};

export default function Home() {
  const [formData, setFormData] = useState<FormData>({
    origin: "",
    destination: "",
    currency: "USD",
    budget: "",
    start_date: "",
    end_date: "",
    vacation_style: "Balanced",
    notes: "",
  });

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<Payload | null>(null);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const payload = {
      origin: formData.origin,
      destination: formData.destination,
      currency: formData.currency,
      budget: Number(formData.budget),
      start_date: formData.start_date,
      end_date: formData.end_date,
      vacation_style: formData.vacation_style,
      notes: formData.notes,
    };

    setLoading(true);
    try {
      const res = await fetch("/api/travel-plan", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    throw new Error("Failed to generate plan");
  }

  const data = await res.json();
  setResult(data);
} catch (error) {
  console.error(error);
  setResult({
    error: "Something went wrong while generating the plan.",
  } as any);
} finally {
  setLoading(false);
}
  };

  type TravelResult = {
    error?: string;
    trip_summary?: {
      origin?: string;
      destination?: string;
      budget?: string;
      dates?: string;
      duration_days?: number;
      style?: string;
      notes?: string;
    };
    flight_recommendation?: {
      summary?: string;
      booking_tips?: string[];
      suggested_links?: Array<{
        label?: string;
        url?: string;
      }>;
    };
    
    hotel_recommendation?: {
      summary?: string;
      recommended_areas?: Array<{
        area?: string;
        why?: string;
      }> | string[];
      booking_tips?: string[];
      suggested_links?: Array<{
        label?: string;
        url?: string;
      }>;
    };
    itinerary?: Array<{
      day?: number;
      title?: string;
      activities?: string[];
      plan?: string;
      text?: string;
    }>;
    useful_links?: Array<{
      label?: string;
      url?: string;
      title?: string;
      name?: string;
      link?: string;
      href?: string;
    }>;
  };
  
  const travelResult = (result ?? null) as TravelResult | null;

  return (
    <div className="min-h-screen bg-blue-50 flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-5xl bg-white rounded-xl shadow-md p-6 md:p-8">
        <div className="grid gap-8 md:grid-cols-2 md:gap-10">
          {/* Left column: intro / product feel */}
          <div className="flex flex-col justify-center">
            <h1 className="text-3xl md:text-4xl font-semibold text-gray-900">
              AI Travel Planner
            </h1>
            <p className="mt-3 text-sm md:text-base text-gray-600">
              Tell us your preferences — we’ll generate a personalized trip plan.
            </p>
            <div className="mt-6 space-y-3 text-sm text-gray-600">
              <p className="font-medium text-gray-800">
                What you&apos;ll get:
              </p>
              <ul className="list-disc list-inside space-y-1">
                <li>High-level trip overview tailored to your budget.</li>
                <li>Suggested pacing and experiences for your vacation style.</li>
                <li>Clear structure for your start and end dates.</li>
              </ul>
            </div>
          </div>
          {/* Right column: form */}
          <div>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Origin */}
              <div className="space-y-1.5">
                <label
                  htmlFor="origin"
                  className="block text-sm font-medium text-gray-800"
                >
                  Origin
                </label>
                <input
                  id="origin"
                  type="text"
                  value={formData.origin}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, origin: e.target.value }))
                  }
                  placeholder="e.g., New York"
                  className="w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-400"
                  required
                />
              </div>
              {/* Destination */}
              <div className="space-y-1.5">
                <label
                  htmlFor="destination"
                  className="block text-sm font-medium text-gray-800"
                >
                  Destination
                </label>
                <input
                  id="destination"
                  type="text"
                  value={formData.destination}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      destination: e.target.value,
                    }))
                  }
                  placeholder="e.g., Tokyo"
                  className="w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-400"
                  required
                />
              </div>
              {/* Budget section (currency + amount) */}
              <div className="space-y-1.5">
                <span className="block text-sm font-medium text-gray-800">
                  Budget
                </span>
                <div className="grid grid-cols-[0.9fr,1.4fr] gap-3">
                  <div>
                    <label
                      htmlFor="currency"
                      className="sr-only"
                    >
                      Currency
                    </label>
                    <select
                      id="currency"
                      aria-label="Currency"
                      value={formData.currency}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          currency: e.target.value as FormData["currency"],
                        }))
                      }
                      className="w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-400"
                    >
                      <option value="USD">USD ($)</option>
                      <option value="CNY">CNY (¥)</option>
                      <option value="EUR">EUR (€)</option>
                      <option value="JPY">JPY (¥)</option>
                    </select>
                  </div>
                  <div>
                    <label
                      htmlFor="budget"
                      className="sr-only"
                    >
                      Budget amount
                    </label>
                    <input
                      id="budget"
                      type="number"
                      min={0}
                      value={formData.budget}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, budget: e.target.value }))
                      }
                      placeholder="e.g., 1500"
                      className="w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-400"
                      required
                    />
                  </div>
                </div>
              </div>
              {/* Start Date */}
              <div className="space-y-1.5">
                <label
                  htmlFor="start_date"
                  className="block text-sm font-medium text-gray-800"
                >
                  Start Date
                </label>
                <input
                  id="start_date"
                  type="date"
                  value={formData.start_date}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      start_date: e.target.value,
                    }))
                  }
                  className="w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-400"
                  required
                />
              </div>
              {/* End Date */}
              <div className="space-y-1.5">
                <label
                  htmlFor="end_date"
                  className="block text-sm font-medium text-gray-800"
                >
                  End Date
                </label>
                <input
                  id="end_date"
                  type="date"
                  value={formData.end_date}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      end_date: e.target.value,
                    }))
                  }
                  className="w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-400"
                  required
                />
              </div>
              {/* Vacation Style */}
              <div className="space-y-1.5">
                <label
                  htmlFor="vacation_style"
                  className="block text-sm font-medium text-gray-800"
                >
                  Vacation Style
                </label>
                <select
                  id="vacation_style"
                  value={formData.vacation_style}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      vacation_style: e.target.value,
                    }))
                  }
                  className="w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-400"
                  required
                >
                  <option>Balanced</option>
                  <option>Relaxed</option>
                  <option>Food-focused</option>
                  <option>Cultural</option>
                  <option>Adventure</option>
                  <option>Family-friendly</option>
                  <option>Luxury</option>
                </select>
              </div>
              {/* Notes (optional) */}
              <div className="space-y-1.5">
                <label
                  htmlFor="notes"
                  className="block text-sm font-medium text-gray-800"
                >
                  Notes <span className="text-gray-400 text-xs">(optional)</span>
                </label>
                <textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, notes: e.target.value }))
                  }
                  placeholder="Any preferences or special requests..."
                  rows={4}
                  className="w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-400"
                />
              </div>
              {/* Submit button */}
              <button
                type="submit"
                disabled={loading}
                className="mt-2 w-full rounded-md bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white"
              >
                {loading ? "Generating..." : "Generate Plan"}
              </button>
            </form>
          </div>
        </div>
        {/* Below the form: travel plan info */}
                {/* Below the form: travel plan info */}
                <div className="mt-8 border-t border-gray-100 pt-6">
          <h2 className="text-lg font-semibold text-gray-900">
            Your Travel Plan
          </h2>

          {loading ? (
            <p className="mt-1 text-sm text-gray-600">
              Generating your travel plan...
            </p>
          ) : travelResult === null ? (
            <p className="mt-1 text-sm text-gray-600">
              Your generated itinerary will appear here after submission.
            </p>
          ) : (
            <div className="mt-4 space-y-4">
              {travelResult.error ? (
                <div className="rounded-xl bg-red-50 p-4 text-sm text-red-700">
                  {travelResult.error}
                </div>
              ) : null}

              <div className="rounded-xl bg-white p-4 shadow">
                <div className="text-base font-semibold text-gray-900">
                  🧾 Trip Summary
                </div>
                <div className="mt-2 space-y-1 text-sm text-gray-700">
                  <p>
                    <span className="font-medium">Origin:</span>{" "}
                    {travelResult.trip_summary?.origin ?? "—"}
                  </p>
                  <p>
                    <span className="font-medium">Destination:</span>{" "}
                    {travelResult.trip_summary?.destination ?? "—"}
                  </p>
                  <p>
                    <span className="font-medium">Budget:</span>{" "}
                    {travelResult.trip_summary?.budget ?? "—"}
                  </p>
                  <p>
                    <span className="font-medium">Dates:</span>{" "}
                    {travelResult.trip_summary?.dates ?? "—"}
                  </p>
                  <p>
                    <span className="font-medium">Duration:</span>{" "}
                    {travelResult.trip_summary?.duration_days ?? "—"} days
                  </p>
                  <p>
                    <span className="font-medium">Style:</span>{" "}
                    {travelResult.trip_summary?.style ?? "—"}
                  </p>
                  <p>
                    <span className="font-medium">Notes:</span>{" "}
                    {travelResult.trip_summary?.notes || "—"}
                  </p>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-xl bg-white p-4 shadow">
                  <div className="text-base font-semibold text-gray-900">
                    ✈️ Flight Recommendation
                  </div>

                  <div className="mt-2 space-y-2 text-sm text-gray-700">
                    <p>{travelResult.flight_recommendation?.summary ?? "—"}</p>

                    {(travelResult.flight_recommendation?.booking_tips?.length ?? 0) > 0 && (
                      <div>
                        <div className="font-medium text-gray-900">Booking Tips</div>
                        <ul className="mt-1 list-disc pl-5">
                          {travelResult.flight_recommendation?.booking_tips?.map((tip, idx) => (
                            <li key={idx}>{tip}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {(travelResult.flight_recommendation?.suggested_links?.length ?? 0) > 0 && (
                      <div>
                        <div className="font-medium text-gray-900">Suggested Links</div>
                        <div className="mt-1 space-y-1">
                        {travelResult.flight_recommendation?.suggested_links?.map((link, idx) => {
  if (!link || typeof link !== "object") return null;

  const label = link.label ?? "Open Link";
  const url = link.url ?? "#";

  return (
    <a
      key={`${url}-${idx}`}
      href={url}
      target="_blank"
      rel="noreferrer"
      className="block text-sm font-medium text-blue-700 hover:text-blue-800 hover:underline"
    >
      {label}
    </a>
  );
})}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                

                <div className="rounded-xl bg-white p-4 shadow">
  <div className="text-base font-semibold text-gray-900">
    🏨 Hotel Recommendation
  </div>

  <div className="mt-2 space-y-2 text-sm text-gray-700">
    <p>{travelResult.hotel_recommendation?.summary ?? "—"}</p>

    {(travelResult.hotel_recommendation?.recommended_areas?.length ?? 0) > 0 && (
      <div>
        <div className="font-medium text-gray-900">Recommended Areas</div>
        <ul className="mt-1 list-disc pl-5">
          {travelResult.hotel_recommendation?.recommended_areas?.map((item, idx) => {
            if (!item || typeof item !== "object") return null;

            return (
              <li key={idx}>
                <span className="font-medium">{item.area ?? "Area"}</span>
                {item.why ? ` — ${item.why}` : ""}
              </li>
            );
          })}
        </ul>
      </div>
    )}

    {(travelResult.hotel_recommendation?.booking_tips?.length ?? 0) > 0 && (
      <div>
        <div className="font-medium text-gray-900">Booking Tips</div>
        <ul className="mt-1 list-disc pl-5">
          {travelResult.hotel_recommendation?.booking_tips?.map((tip, idx) => (
            <li key={idx}>{tip}</li>
          ))}
        </ul>
      </div>
    )}

    {(travelResult.hotel_recommendation?.suggested_links?.length ?? 0) > 0 && (
      <div>
        <div className="font-medium text-gray-900">Suggested Links</div>
        <div className="mt-1 space-y-1">
          {travelResult.hotel_recommendation?.suggested_links?.map((link, idx) => {
            if (!link || typeof link !== "object") return null;

            const label = link.label ?? "Open Link";
            const url = link.url ?? "#";

            return (
              <a
                key={`${url}-${idx}`}
                href={url}
                target="_blank"
                rel="noreferrer"
                className="block text-sm font-medium text-blue-700 hover:text-blue-800 hover:underline"
              >
                {label}
              </a>
            );
          })}
        </div>
      </div>
    )}
  </div>
</div>
</div>  

              <div className="rounded-xl bg-white p-4 shadow">
                <div className="text-base font-semibold text-gray-900">
                  🗓️ Day-by-Day Plan
                </div>
                <div className="mt-3 space-y-3">
                  {(travelResult.itinerary?.length ?? 0) === 0 ? (
                    <p className="text-sm text-gray-700">—</p>
                  ) : (
                    travelResult.itinerary!.map((item, idx) => {
                      const dayNumber = item.day ?? idx + 1;
                      return (
                        <div
                          key={`${dayNumber}-${idx}`}
                          className="rounded-lg border border-gray-100 bg-white p-3"
                        >
                          <div className="text-sm font-semibold text-gray-900">
                            Day {dayNumber}
                            {item.title ? `: ${item.title}` : ""}
                          </div>

                          {(item.activities?.length ?? 0) > 0 ? (
                            <ul className="mt-2 list-disc pl-5 text-sm text-gray-700">
                              {item.activities?.map((activity, i) => (
                                <li key={i}>{activity}</li>
                              ))}
                            </ul>
                          ) : (
                            <div className="mt-1 text-sm text-gray-700">
                              {item.plan ?? item.text ?? "—"}
                            </div>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              <div className="rounded-xl bg-white p-4 shadow">
                <div className="text-base font-semibold text-gray-900">
                  🔗 Useful Links
                </div>
                <div className="mt-3 space-y-2">
  {(travelResult.useful_links?.length ?? 0) === 0 ? (
    <p className="text-sm text-gray-700">—</p>
  ) : (
    travelResult.useful_links!.map((link, idx) => {
      if (!link || typeof link !== "object") {
        return null;
      }

      const label =
        link.label || link.title || link.name || "Open Link";
      const url =
        link.url || link.link || link.href || "#";

      return (
        <a
          key={`${url}-${idx}`}
          href={url}
          target="_blank"
          rel="noreferrer"
          className="block text-sm font-medium text-blue-700 hover:text-blue-800 hover:underline"
        >
          {String(label)}
        </a>
      );
    })
  )}
</div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}