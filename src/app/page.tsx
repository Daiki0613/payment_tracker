"use client";

import { ExpensesWithParticipants, getExpenses } from "@/prisma/payments";
import { currencyToString } from "@/utils/currency";
import { Currency } from "@prisma/client";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import { FaChevronDown, FaChevronUp, FaMoneyBillWave, FaUserFriends } from "react-icons/fa";
import { IoCalendarOutline } from "react-icons/io5";

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
      <div className="flex h-96 items-center justify-center">
        <div className="text-center">
          <div className="mb-2 h-12 w-12 animate-spin rounded-full border-4 border-indigo-200 border-t-indigo-600 mx-auto"></div>
          <div className="text-lg font-medium text-gray-700 dark:text-gray-300">Loading expenses...</div>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            If this does not load, try refreshing...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Recent Payments</h1>
        <Link 
          href="/new" 
          className="inline-flex items-center rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
        >
          <FaMoneyBillWave className="mr-2" />
          New Payment
        </Link>
      </div>

      {expenses.length === 0 ? (
        <div className="card flex flex-col items-center justify-center py-12">
          <div className="mb-4 rounded-full bg-indigo-100 p-4 text-indigo-600 dark:bg-indigo-900 dark:bg-opacity-30 dark:text-indigo-400">
            <FaMoneyBillWave size={32} />
          </div>
          <h2 className="mb-2 text-xl font-semibold text-gray-900 dark:text-white">No expenses yet</h2>
          <p className="mb-6 text-center text-gray-600 dark:text-gray-400">
            Start tracking your expenses by creating your first payment.
          </p>
          <Link
            href="/new"
            className="btn btn-primary inline-flex items-center"
          >
            <FaMoneyBillWave className="mr-2" />
            Create First Payment
          </Link>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-1">
          {expenses.map((expense, index) => (
            <div
              key={index}
              className="card overflow-hidden border border-gray-100 dark:border-gray-700"
            >
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                <Link href={"/view/" + expense.id} className="group mb-2 sm:mb-0">
                  <h2 className="text-xl font-semibold text-gray-900 group-hover:text-indigo-600 dark:text-white dark:group-hover:text-indigo-400 transition-colors">
                    {expense.description}
                  </h2>
                  <div className="mt-1 flex items-center text-sm text-gray-500 dark:text-gray-400">
                    <IoCalendarOutline className="mr-1" />
                    <span>{new Date().toLocaleDateString()}</span>
                  </div>
                </Link>
                <div className="flex flex-wrap items-center gap-4">
                  <div className="rounded-full bg-indigo-50 px-4 py-1.5 text-sm font-medium text-indigo-700 dark:bg-indigo-900 dark:bg-opacity-30 dark:text-indigo-400">
                    ¥ {expense.amount}
                  </div>
                  <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                    <span className="mr-1 font-medium">Paid by:</span> {expense.paidBy.name}
                  </div>
                </div>
              </div>
              
              <div className="mt-4 border-t border-gray-100 pt-4 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                    <FaUserFriends className="mr-2" />
                    <span>
                      {expense.participants.length === 9 ? (
                        <span>Everyone</span>
                      ) : (
                        expense.participants.map(
                          (participant, idx) => 
                            (idx > 0 ? ", " : "") + participant.user.name
                        )
                      )}
                    </span>
                  </div>
                  <button
                    className="flex items-center text-sm font-medium text-indigo-600 transition-colors hover:text-indigo-800 focus:outline-none dark:text-indigo-400 dark:hover:text-indigo-300"
                    onClick={() => toggleDetails(index)}
                  >
                    {expandedIndex === index ? (
                      <>
                        <span>Hide Details</span>
                        <FaChevronUp className="ml-1" />
                      </>
                    ) : (
                      <>
                        <span>Show Details</span>
                        <FaChevronDown className="ml-1" />
                      </>
                    )}
                  </button>
                </div>
                
                {expandedIndex === index && (
                  <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {expense.participants.map((participant, idx) => (
                      <div key={idx} className="rounded-lg bg-gray-50 p-3 dark:bg-gray-800">
                        <div className="font-medium text-gray-900 dark:text-white">
                          {participant.user.name}
                        </div>
                        <div className="mt-1 text-sm">
                          <span className="font-medium text-indigo-600 dark:text-indigo-400">
                            {currencyToString(expense.currency)}
                            {participant.amountOwed}
                          </span>
                          {participant.description && (
                            <span className="ml-2 text-gray-500 dark:text-gray-400">
                              ({participant.description})
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Home;
