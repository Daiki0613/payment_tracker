"use client";

import { ExpensesWithParticipants, getExpenses } from "@/prisma/payments";
import Link from "next/link";
import React, { useEffect, useState } from "react";

const Home: React.FC = () => {
  const [expenses, setExpenses] = useState<ExpensesWithParticipants>([]);
  const [loading, setLoading] = useState(true);
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  const toggleDetails = (index: number) => {
    if (expandedIndex === index) {
      setExpandedIndex(null); // Collapse if already expanded
    } else {
      setExpandedIndex(index); // Expand if collapsed or different item clicked
    }
  };

  useEffect(() => {
    const fetchExpenses = async () => {
      const data = await getExpenses();
      setExpenses(data);
      setLoading(false);
    };
    fetchExpenses();
  }, []);

  if (loading) {
    return (
      <main className="flex min-h-screen justify-center">
        <div>
          <div className="text-gray-600">Loading expenses...</div>
          <div className="text-gray-600 text-sm">
            If this does not load, try refreshing...
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen justify-center">
      <div className="flex flex-col items-center w-full max-w-7xl m-1">
        <div className="text-2xl font-bold mb-4 mt-2">All Payments</div>

        {expenses.length === 0 ? (
          <p className="text-gray-600 mt-4">No expenses yet...</p>
        ) : (
          expenses.map((expense, index) => (
            <div
              key={index}
              className="w-full bg-white shadow-md rounded-lg p-4 mb-1"
            >
              <div className="grid grid-cols-3 gap-4">
                <Link href={"/view/" + expense.id}>
                  <div className="col-span-1">
                    <h1 className="text-lg font-bold">{expense.description}</h1>
                  </div>
                </Link>
                <p className="text-gray-600">Amount: {expense.amount}</p>
                <p className="text-gray-600">Paid by: {expense.paidBy.name}</p>
              </div>
              <div className="border-t border-gray-200 pt-2">
                <div className="flex justify-between">
                  <div className="text-gray-600">
                    {expense.participants.length === 9 ? (
                      <span>Everyone</span>
                    ) : (
                      expense.participants.map(
                        (participant, idx) => participant.user.name + " "
                      )
                    )}
                  </div>
                  <button
                    className="text-sm font-bold mb-2 text-blue-600 focus:outline-none"
                    onClick={() => toggleDetails(index)}
                  >
                    {expandedIndex === index ? "Hide Details" : "Show Details"}
                  </button>
                </div>
                {expandedIndex === index && (
                  <div className="mt-2 grid grid-cols-3 gap-2">
                    {expense.participants.map((participant, idx) => (
                      <div key={idx} className="bg-gray-100 p-2 rounded-lg">
                        <p className="text-sm">
                          {participant.user.name}: {participant.amountOwed}
                          {participant.description &&
                            ` (${participant.description})`}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </main>
  );
};

export default Home;
