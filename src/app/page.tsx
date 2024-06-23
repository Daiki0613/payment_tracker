"use client";

import { ExpensesWithParticipants, getExpenses } from "@/prisma/payments";
import Link from "next/link";
import React, { useEffect, useState } from "react";

const Home: React.FC = () => {
  const [expenses, setExpenses] = useState<ExpensesWithParticipants>([]);
  const [loading, setLoading] = useState(true);

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
        <p className="text-gray-600">Loading expenses...</p>
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
                <Link href={"/edit/" + expense.id}>
                  <div className="col-span-1">
                    <h1 className="text-lg font-bold">{expense.description}</h1>
                  </div>
                </Link>
                <p className="text-gray-600">Amount: {expense.amount}</p>
                <p className="text-gray-600">Paid by: {expense.paidBy.name}</p>
              </div>
              <div className="border-t border-gray-200 pt-2">
                <h2 className="text-sm font-bold mb-2">Details:</h2>
                <div className="grid grid-cols-2 gap-2">
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
              </div>
            </div>
          ))
        )}
      </div>
    </main>
  );
};

export default Home;
