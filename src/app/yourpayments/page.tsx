"use client";

import { SessionPayload, getSession } from "@/auth/auth";
import {
  ExpensesWithParticipants,
  Payment,
  PaymentSummary,
  getExpenseParticipantByUserId,
  getExpenses,
  getPaidExpensesByUserId,
  getPaymentSummary,
} from "@/prisma/payments";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";

const Home: React.FC = () => {
  const [session, setSession] = useState<SessionPayload>();
  const [loggedIn, setLoggedIn] = useState<boolean>(true);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [paymentSummary, setPaymentSummary] = useState<PaymentSummary>();

  const [allUserExpenses, setAllUserExpenses] = useState<Payment[]>([]);
  const [userExpenseSummary, setUserExpenseSummary] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchExpenses = async () => {
      const session = await getSession();
      if (!session) {
        setLoading(false);
        setLoggedIn(false);
        return;
      }
      setSession(session);

      const paymentSummary = await getPaymentSummary(session.userId);
      setPaymentSummary(paymentSummary);
      setAllUserExpenses(paymentSummary.allTransactions);
      setUserExpenseSummary(paymentSummary.summarizedPayments);
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
  if (!loggedIn) {
    return (
      <main className="flex min-h-screen justify-center">
        <p className="text-gray-600">Please log in to view your expenses</p>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen justify-center ">
      <div className="flex flex-col items-center w-full max-w-2xl m-4 bg-gray-100">
        <div className="text-2xl font-bold mb-4 mt-4">
          {session?.name}&apos;s Payments Summary
        </div>
        {userExpenseSummary.length === 0 ? (
          <p className="text-gray-600 mt-4">No expenses yet...</p>
        ) : (
          userExpenseSummary.map((expense, index) => {
            if (expense.payerId === session?.userId) {
              return (
                <p key={index} className="w-full max-w-lg text-left ml-5">
                  {expense.participantName} owes you{" "}
                  <span className="text-green-600">{expense.amount}</span> in
                  total
                </p>
              );
            } else if (expense.participantId === session?.userId) {
              return (
                <p key={index} className="w-full max-w-lg text-left ml-5">
                  You owe {expense.payerName}{" "}
                  <span className="text-red-600">{expense.amount}</span> in
                  total
                </p>
              );
            } else {
              return (
                <p key={index} className="w-full max-w-lg text-left ml-5">
                  {expense.participantName} owes {expense.payerName}{" "}
                  {expense.amount} in total
                </p>
              );
            }
          })
        )}

        <button
          className="text-xl font-semibold mb-4 mt-8 focus:outline-none"
          onClick={() => setDetailsOpen(!detailsOpen)}
        >
          Details
          <svg
            className={`w-6 h-6 inline-block ml-2 transform ${
              detailsOpen ? "rotate-180" : "rotate-0"
            } transition-transform duration-300`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M19 9l-7 7-7-7"
            ></path>
          </svg>
        </button>

        {detailsOpen && (
          <div className="w-full flex flex-col items-center">
            {allUserExpenses.length === 0 ? (
              <p className="text-gray-600 mt-4">No expenses yet...</p>
            ) : (
              allUserExpenses.map((expense, index) => {
                if (expense.payerId === session?.userId) {
                  return (
                    <p key={index} className="w-full max-w-lg text-left ml-5">
                      {expense.participantName} owes you{" "}
                      <span className="text-green-600">{expense.amount}</span>{" "}
                      for {expense.description}
                    </p>
                  );
                } else if (expense.participantId === session?.userId) {
                  return (
                    <p key={index} className="w-full max-w-lg text-left ml-5">
                      You owe {expense.payerName}{" "}
                      <span className="text-red-600">{expense.amount}</span> for{" "}
                      {expense.description}
                    </p>
                  );
                } else {
                  return (
                    <p key={index} className="w-full max-w-lg text-left ml-5">
                      {expense.participantName} owes {expense.payerName}{" "}
                      {expense.amount} for {expense.description}
                    </p>
                  );
                }
              })
            )}
          </div>
        )}
      </div>
    </main>
  );
};

export default Home;
