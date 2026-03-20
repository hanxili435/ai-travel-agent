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

export type BookingLink = { label: string; url: string };

/** Backend API success response (exact JSON shape) */
export type TravelPlanResult = {
  trip_summary: {
    origin: string;
    destination: string;
    currency: string;
    budget: number;
    start_date: string;
    end_date: string;
    vacation_style: string;
    notes: string;
  };
  itinerary: Array<{
    day: number;
    title: string;
    activities: string[];
  }>;
  budget_breakdown: {
    flights: string;
    hotels: string;
    activities: string;
    total: string;
    remaining_budget: string;
  };
  booking_links_summary: {
    flights: BookingLink[];
    hotels: BookingLink[];
    activities: BookingLink[];
  };
  end_message: string;
};

type TravelPlanError = { error: string };

type TravelPlanState = TravelPlanResult | TravelPlanError | null;

function isTravelPlanError(r: TravelPlanState): r is TravelPlanError {
  return (
    r !== null &&
    typeof r === "object" &&
    "error" in r &&
    typeof (r as TravelPlanError).error === "string"
  );
}

function isTravelPlanSuccess(r: TravelPlanState): r is TravelPlanResult {
  return r !== null && !isTravelPlanError(r);
}

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
  const [result, setResult] = useState<TravelPlanState>(null);

  const [validationErrors, setValidationErrors] = useState<{
    origin?: string;
    destination?: string;
    budget?: string;
    dates?: string;
  } | null>(null);

  const [lowBudgetWarning, setLowBudgetWarning] = useState<string | null>(
    null,
  );

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    // Clear old messages before validating a new submission.
    setValidationErrors(null);
    setLowBudgetWarning(null);

    const originTrimmed = formData.origin.trim();
    const destinationTrimmed = formData.destination.trim();

    const isOnlyNumbers = (value: string) => /^\d+$/.test(value);

    if (originTrimmed.length < 2 || isOnlyNumbers(originTrimmed)) {
      setValidationErrors({
        origin:
          "Origin must be at least 2 characters and must not be only numbers.",
      });
      return;
    }

    if (
      destinationTrimmed.length < 2 ||
      isOnlyNumbers(destinationTrimmed)
    ) {
      setValidationErrors({
        destination:
          "Destination must be at least 2 characters and must not be only numbers.",
      });
      return;
    }

    const budgetNumber = Number(formData.budget);
    const hasValidBudget = Number.isFinite(budgetNumber) && budgetNumber > 0;

    if (!hasValidBudget) {
      setValidationErrors({
        budget: "Budget must be greater than 0.",
      });
      return;
    }

    if (budgetNumber < 100) {
      setLowBudgetWarning(
        "This budget may be too low for the selected trip.",
      );
    }

    const parseLocalMidnight = (value: string) => {
      // Expect YYYY-MM-DD
      const parts = value.split("-");
      if (parts.length !== 3) return null;
      const [y, m, d] = parts.map((p) => Number(p));
      if (!Number.isFinite(y) || !Number.isFinite(m) || !Number.isFinite(d)) {
        return null;
      }
      const dt = new Date(y, m - 1, d);
      dt.setHours(0, 0, 0, 0);
      return dt;
    };

    const start = parseLocalMidnight(formData.start_date);
    const end = parseLocalMidnight(formData.end_date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (!start || !end) {
      setValidationErrors({
        dates: "Please select valid start and end dates.",
      });
      return;
    }

    if (start.getTime() < today.getTime()) {
      setValidationErrors({
        dates: "Start date must be today or later.",
      });
      return;
    }

    if (end.getTime() < start.getTime()) {
      setValidationErrors({
        dates: "End date must be on or after the start date.",
      });
      return;
    }

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

      const data = (await res.json()) as TravelPlanResult;
      setResult(data);
    } catch (error) {
      console.error(error);
      setResult({
        error: "Something went wrong while generating the plan.",
      });
    } finally {
      setLoading(false);
    }
  };

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
                {validationErrors?.origin ? (
                  <p className="text-xs text-red-700">
                    {validationErrors.origin}
                  </p>
                ) : null}
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
                {validationErrors?.destination ? (
                  <p className="text-xs text-red-700">
                    {validationErrors.destination}
                  </p>
                ) : null}
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
                {validationErrors?.budget ? (
                  <p className="text-xs text-red-700">{validationErrors.budget}</p>
                ) : lowBudgetWarning ? (
                  <p className="text-xs text-amber-700">
                    {lowBudgetWarning}
                  </p>
                ) : null}
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
                {validationErrors?.dates ? (
                  <p className="text-xs text-red-700">
                    {validationErrors.dates}
                  </p>
                ) : null}
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
        <div className="mt-8 border-t border-gray-100 pt-6">
          <h2 className="text-lg font-semibold text-gray-900">
            Your Travel Plan
          </h2>

          {loading ? (
            <p className="mt-1 text-sm text-gray-600">
              Generating your travel plan...
            </p>
          ) : result === null ? (
            <p className="mt-1 text-sm text-gray-600">
              Your generated itinerary will appear here after submission.
            </p>
          ) : (
            <div className="mt-4 space-y-4">
              {isTravelPlanError(result) ? (
                <div className="rounded-xl bg-red-50 p-4 text-sm text-red-700">
                  {result.error}
                </div>
              ) : null}

              {isTravelPlanSuccess(result) ? (
                <>
                  <div className="rounded-xl bg-white p-4 shadow">
                    <div className="text-base font-semibold text-gray-900">
                      Trip Summary
                    </div>
                    <div className="mt-2 space-y-1 text-sm text-gray-700">
                      <p>
                        <span className="font-medium">Origin:</span>{" "}
                        {result.trip_summary?.origin ?? "—"}
                      </p>
                      <p>
                        <span className="font-medium">Destination:</span>{" "}
                        {result.trip_summary?.destination ?? "—"}
                      </p>
                      <p>
                        <span className="font-medium">Currency:</span>{" "}
                        {result.trip_summary?.currency ?? "—"}
                      </p>
                      <p>
                        <span className="font-medium">Budget:</span>{" "}
                        {typeof result.trip_summary?.budget === "number" &&
                        !Number.isNaN(result.trip_summary.budget)
                          ? result.trip_summary.budget
                          : "—"}
                      </p>
                      <p>
                        <span className="font-medium">Start Date:</span>{" "}
                        {result.trip_summary?.start_date ?? "—"}
                      </p>
                      <p>
                        <span className="font-medium">End Date:</span>{" "}
                        {result.trip_summary?.end_date ?? "—"}
                      </p>
                      <p>
                        <span className="font-medium">Vacation Style:</span>{" "}
                        {result.trip_summary?.vacation_style ?? "—"}
                      </p>
                      <p>
                        <span className="font-medium">Notes:</span>{" "}
                        {result.trip_summary?.notes?.trim()
                          ? result.trip_summary.notes
                          : "—"}
                      </p>
                    </div>
                  </div>

                  <div className="rounded-xl bg-white p-4 shadow">
                    <div className="text-base font-semibold text-gray-900">
                      Day-by-Day Plan
                    </div>
                    <div className="mt-3 space-y-3">
                      {(result.itinerary?.length ?? 0) === 0 ? (
                        <p className="text-sm text-gray-700">—</p>
                      ) : (
                        (result.itinerary ?? []).map((item, idx) => {
                          const dayNumber = item?.day ?? idx + 1;
                          const title = item?.title?.trim() ? item.title : "";
                          const activities = Array.isArray(item?.activities)
                            ? item.activities
                            : [];
                          return (
                            <div
                              key={`${dayNumber}-${idx}`}
                              className="rounded-lg border border-gray-100 bg-gray-50/80 p-3"
                            >
                              <div className="text-sm font-semibold text-gray-900">
                                Day {dayNumber}
                                {title ? `: ${title}` : ""}
                              </div>
                              {activities.length === 0 ? (
                                <p className="mt-2 text-sm text-gray-700">—</p>
                              ) : (
                                <ul className="mt-2 list-disc pl-5 text-sm text-gray-700">
                                  {activities.map((activity, i) => (
                                    <li key={i}>
                                      {typeof activity === "string"
                                        ? activity
                                        : String(activity ?? "")}
                                    </li>
                                  ))}
                                </ul>
                              )}
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>

                  <div className="rounded-xl bg-white p-4 shadow">
                    <div className="text-base font-semibold text-gray-900">
                      Total Budget Breakdown
                    </div>
                    <div className="mt-2 space-y-1 text-sm text-gray-700">
                      <p>
                        <span className="font-medium">Flights:</span>{" "}
                        {result.budget_breakdown?.flights ?? "—"}
                      </p>
                      <p>
                        <span className="font-medium">Hotels:</span>{" "}
                        {result.budget_breakdown?.hotels ?? "—"}
                      </p>
                      <p>
                        <span className="font-medium">Activities:</span>{" "}
                        {result.budget_breakdown?.activities ?? "—"}
                      </p>
                      <p>
                        <span className="font-medium">Total:</span>{" "}
                        {result.budget_breakdown?.total ?? "—"}
                      </p>
                      <p>
                        <span className="font-medium">Remaining Budget:</span>{" "}
                        {result.budget_breakdown?.remaining_budget ?? "—"}
                      </p>
                    </div>
                  </div>

                  <div className="rounded-xl bg-white p-4 shadow">
                    <div className="text-base font-semibold text-gray-900">
                      Booking Links Summary
                    </div>
                    <div className="mt-3 space-y-4 text-sm">
                      {(
                        [
                          ["Flights", result.booking_links_summary?.flights],
                          ["Hotels", result.booking_links_summary?.hotels],
                          [
                            "Activities",
                            result.booking_links_summary?.activities,
                          ],
                        ] as const
                      ).map(([label, links]) => (
                        <div key={label}>
                          <div className="font-medium text-gray-900">
                            {label}
                          </div>
                          <div className="mt-2 space-y-2">
                            {[0, 1, 2].map((slot) => {
                              const link = Array.isArray(links)
                                ? links[slot]
                                : undefined;
                              const url = link?.url?.trim();
                              const linkLabel = link?.label?.trim() || "—";
                              if (!url) {
                                return (
                                  <div key={slot} className="text-gray-500">
                                    {linkLabel}
                                  </div>
                                );
                              }
                              return (
                                <a
                                  key={slot}
                                  href={url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="block font-medium text-blue-700 hover:text-blue-800 hover:underline"
                                >
                                  {linkLabel}
                                </a>
                              );
                            })}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="rounded-xl bg-white p-4 shadow">
                    <div className="text-base font-semibold text-gray-900">
                      Travel Notes
                    </div>
                    <p className="mt-2 text-sm text-gray-700">
                      {result.end_message?.trim()
                        ? result.end_message
                        : "—"}
                    </p>
                  </div>
                </>
              ) : null}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}