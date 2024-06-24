"use client";

import { SessionPayload, getSession } from "@/auth/auth";
import PaymentDialog from "@/components/PersonalPaymentDialog";
import {
  ExpensesWithParticipants,
  Payment,
  PaymentSummary,
  createExpense,
  getExpenseParticipantByUserId,
  getExpenses,
  getPaidExpensesByUserId,
  getPaymentSummary,
} from "@/prisma/payments";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";

const Home: React.FC = () => {
  const [session, setSession] = useState<SessionPayload>();
  const [loggedIn, setLoggedIn] = useState<boolean>(true);
  const [paymentSummary, setPaymentSummary] = useState<PaymentSummary>();

  const [loading, setLoading] = useState(true);
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState(0);
  const [paymentRecipient, setPaymentRecipient] = useState<{
    name: string;
    id: number;
  }>({ name: "", id: 0 });
  const [paymentErrorMsg, setPaymentErrorMsg] = useState<string | null>(null);

  const [openDropdowns, setOpenDropdowns] = useState<{
    [key: number]: boolean;
  }>({});

  const toggleDropdown = (index: number) => {
    setOpenDropdowns((prevState) => ({
      ...prevState,
      [index]: !prevState[index],
    }));
  };

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
        {paymentSummary?.summarizedPayments.length === 0 ? (
          <p className="text-gray-600 mt-4">No expenses yet...</p>
        ) : (
          paymentSummary?.summarizedPayments.map(
            ({ summary, details }, index) => {
              const preview = () => {
                if (summary.amount == 0) {
                  const other =
                    summary.payerId !== session?.userId
                      ? summary.payerName
                      : summary.participantName;
                  return (
                    <p
                      key={index}
                      className="w-full max-w-lg text-left ml-5 p-2"
                    >
                      Payment completed with {other}
                    </p>
                  );
                } else if (summary.payerId === session?.userId) {
                  return (
                    <p
                      key={index}
                      className="w-full max-w-lg text-left ml-5 p-2"
                    >
                      {summary.participantName} owes you{" "}
                      <span className="text-green-600">{summary.amount}</span>{" "}
                      in total
                    </p>
                  );
                } else if (summary.participantId === session?.userId) {
                  return (
                    <p
                      key={index}
                      className="w-full max-w-lg text-left ml-5 flex justify-between p-2"
                    >
                      <p>
                        You owe {summary.payerName}{" "}
                        <span className="text-red-600">{summary.amount}</span>{" "}
                        in total
                      </p>
                      <button
                        onClick={() => {
                          setPaymentDialogOpen(true);
                          setPaymentRecipient({
                            name: summary.payerName,
                            id: summary.payerId,
                          });
                        }}
                        className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold py-0.5 px-4 rounded shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-opacity-50 p-2"
                      >
                        Make payment
                      </button>
                    </p>
                  );
                } else {
                  return (
                    <p key={index} className="w-full max-w-lg text-left ml-5">
                      {summary.participantName} owes {summary.payerName}{" "}
                      {summary.amount} in total
                    </p>
                  );
                }
              };
              const content = () => {
                return (
                  <div className="w-full flex flex-col items-center bg-gray-200 text-gray-600 p-2">
                    {paymentSummary?.summarizedPayments.length === 0 ? (
                      <p className=" mt-4">No expenses yet...</p>
                    ) : (
                      details.map((expense, index) => {
                        if (expense.personalPayment) {
                          if (expense.payerId === session?.userId) {
                            return (
                              <p
                                key={index}
                                className="w-full max-w-lg text-left ml-5"
                              >
                                <Link
                                  href={`view/${expense.paymentId}`}
                                  className="hover:text-black"
                                >
                                  You paid {expense.participantName}:{" "}
                                  {expense.amount}
                                </Link>
                              </p>
                            );
                          } else {
                            return (
                              <p
                                key={index}
                                className="w-full max-w-lg text-left ml-5"
                              >
                                <Link
                                  href={`view/${expense.paymentId}`}
                                  className="hover:text-black"
                                >
                                  {expense.payerName} paid you: {expense.amount}
                                </Link>
                              </p>
                            );
                          }
                        } else if (expense.payerId === session?.userId) {
                          return (
                            <p
                              key={index}
                              className="w-full max-w-lg text-left ml-5"
                            >
                              {expense.participantName} owes you{" "}
                              <span className="text-green-500">
                                {expense.amount}
                              </span>{" "}
                              for{" "}
                              <Link
                                href={`view/${expense.paymentId}`}
                                className="hover:text-black"
                              >
                                {expense.description}
                              </Link>
                            </p>
                          );
                        } else if (expense.participantId === session?.userId) {
                          return (
                            <p
                              key={index}
                              className="w-full max-w-lg text-left ml-5"
                            >
                              You owe {expense.payerName}{" "}
                              <span className="text-red-600">
                                {expense.amount}
                              </span>{" "}
                              for{" "}
                              <Link
                                href={`view/${expense.paymentId}`}
                                className="hover:text-black"
                              >
                                {expense.description}
                              </Link>
                            </p>
                          );
                        } else {
                          return (
                            <p
                              key={index}
                              className="w-full max-w-lg text-left ml-5"
                            >
                              {expense.participantName} owes {expense.payerName}{" "}
                              {expense.amount} for{" "}
                              <Link
                                href={`view/${expense.paymentId}`}
                                className="hover:text-black"
                              >
                                {expense.description}
                              </Link>
                            </p>
                          );
                        }
                      })
                    )}
                  </div>
                );
              };
              return (
                <div key={index} className="w-full max-w-lg">
                  <div className="flex justify-between">
                    {preview()}
                    <button
                      onClick={() => toggleDropdown(index)}
                      className=" text-gray-700 font-semibold ml-2 rounded shadow-sm focus:outline-none focus:ring-gray-400 focus:ring-opacity-50"
                    >
                      <svg
                        className={`w-6 h-6 inline-block transform ${
                          openDropdowns[index] ? "rotate-180" : "rotate-0"
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
                      {/* {openDropdowns[index] ? "Hide details" : "Show details"} */}
                    </button>
                  </div>
                  {openDropdowns[index] && (
                    <div className="mt-2 ml-5">{content()}</div>
                  )}
                </div>
              );
            }
          )
        )}
      </div>
      <PaymentDialog
        amount={paymentAmount}
        setAmount={setPaymentAmount}
        isOpen={paymentDialogOpen}
        user={paymentRecipient}
        onCancel={() => {
          setPaymentDialogOpen(false);
        }}
        onConfirm={async () => {
          try {
            if (!session) {
              throw new Error("User not logged in");
            }
            await createExpense({
              description: `Payment ${session.name} -> ${paymentRecipient.name}`,
              personalPayment: true,
              amount: paymentAmount,
              paidById: session?.userId,
              participants: [
                {
                  amountOwed: paymentAmount,
                  description: "",
                  name: paymentRecipient.name,
                  id: paymentRecipient.id,
                },
              ],
            });
            setPaymentDialogOpen(false);
            window.location.reload();
          } catch {
            setPaymentErrorMsg("Failed to make payment");
          }
        }}
        error={paymentErrorMsg}
      />
    </main>
  );
};

export default Home;
