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
import { currencyToString } from "@/utils/currency";
import { Currency } from "@prisma/client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { FaChevronDown, FaChevronUp, FaMoneyBillWave, FaUserFriends, FaExchangeAlt } from "react-icons/fa";
import { IoWalletOutline, IoReceiptOutline, IoArrowForward } from "react-icons/io5";

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
  const [totalExpense, setTotalExpense] = useState<number>(0);
  const [totalPaid, setTotalPaid] = useState<number>(0);
  const [totalOwed, setTotalOwed] = useState<number>(0);

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

      let total = 0;
      paymentSummary.summarizedPayments.forEach((payment) => {
        if (payment.summary.payerId === session.userId) {
          total += payment.summary.amount;
        } else {
          total -= payment.summary.amount;
        }
      });
      total = Math.round(total * 100) / 100;
      setTotalExpense(total);
    };
    fetchExpenses();
  }, []);

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="text-center">
          <div className="mb-2 h-12 w-12 animate-spin rounded-full border-4 border-indigo-200 border-t-indigo-600 mx-auto"></div>
          <div className="text-lg font-medium text-gray-700 dark:text-gray-300">Loading payments...</div>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            Please wait while we fetch your payment data...
          </div>
        </div>
      </div>
    );
  }
  
  if (!loggedIn) {
    return (
      <div className="mx-auto max-w-md px-4 py-16 sm:px-6 lg:px-8">
        <div className="card flex flex-col items-center justify-center py-12 text-center">
          <div className="mb-4 rounded-full bg-indigo-100 p-4 text-indigo-600 dark:bg-indigo-900 dark:bg-opacity-30 dark:text-indigo-400">
            <IoWalletOutline size={32} />
          </div>
          <h2 className="mb-2 text-xl font-semibold text-gray-900 dark:text-white">Authentication Required</h2>
          <p className="mb-6 text-gray-600 dark:text-gray-400">
            Please log in to view your payment summary and transaction history.
          </p>
          <Link
            href="/login"
            className="btn btn-primary inline-flex items-center"
          >
            <IoArrowForward className="mr-2" />
            Go to Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Payment Summary
        </h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Track and manage your payments with {session?.name}
        </p>
      </div>
      
      <div className="mb-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <div className="card bg-gradient-to-br from-indigo-500 to-purple-600 text-white">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium">Balance</h3>
            <IoWalletOutline size={24} />
          </div>
          <div className="mt-4">
            {totalExpense > 0 ? (
              <div className="flex flex-col">
                <span className="text-sm opacity-80">To receive</span>
                <span className="text-3xl font-bold">£{totalExpense.toFixed(2)}</span>
                <span className="mt-2 inline-flex items-center text-sm text-green-100">
                  <span className="rounded-full bg-green-200 bg-opacity-30 px-2 py-0.5 text-xs font-medium text-green-100">
                    Positive balance
                  </span>
                </span>
              </div>
            ) : (
              <div className="flex flex-col">
                <span className="text-sm opacity-80">To pay</span>
                <span className="text-3xl font-bold">£{Math.abs(totalExpense).toFixed(2)}</span>
                <span className="mt-2 inline-flex items-center text-sm text-red-100">
                  <span className="rounded-full bg-red-500 bg-opacity-30 px-2 py-0.5 text-xs font-medium text-red-100">
                    Outstanding balance
                  </span>
                </span>
              </div>
            )}
          </div>
        </div>
        
        <div className="card">
          <div className="flex items-center justify-between text-gray-900 dark:text-white">
            <h3 className="text-lg font-medium">Active Settlements</h3>
            <FaExchangeAlt size={20} className="text-indigo-500 dark:text-indigo-400" />
          </div>
          <div className="mt-4">
            <span className="text-3xl font-bold text-gray-900 dark:text-white">
              {paymentSummary?.summarizedPayments.length || 0}
            </span>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
              Active payment relationships
            </p>
          </div>
          <div className="mt-4">
            <Link
              href="/new"
              className="inline-flex items-center text-sm font-medium text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300"
            >
              <span>Create new payment</span>
              <IoArrowForward className="ml-1" />
            </Link>
          </div>
        </div>
        
        <div className="card">
          <div className="flex items-center justify-between text-gray-900 dark:text-white">
            <h3 className="text-lg font-medium">Recent Activity</h3>
            <IoReceiptOutline size={22} className="text-indigo-500 dark:text-indigo-400" />
          </div>
          <div className="mt-4 text-sm text-gray-600 dark:text-gray-400">
            {paymentSummary?.summarizedPayments.length === 0 ? (
              <p>No recent payment activity</p>
            ) : (
              <p>Last updated {new Date().toLocaleDateString()}</p>
            )}
          </div>
          <div className="mt-4">
            <Link
              href="/all"
              className="inline-flex items-center text-sm font-medium text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300"
            >
              <span>View all transactions</span>
              <IoArrowForward className="ml-1" />
            </Link>
          </div>
        </div>
      </div>
      
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Payment Relationships</h2>
      </div>
      
      {paymentSummary?.summarizedPayments.length === 0 ? (
        <div className="card flex flex-col items-center justify-center py-12">
          <div className="mb-4 rounded-full bg-indigo-100 p-4 text-indigo-600 dark:bg-indigo-900 dark:bg-opacity-30 dark:text-indigo-400">
            <FaMoneyBillWave size={32} />
          </div>
          <h2 className="mb-2 text-xl font-semibold text-gray-900 dark:text-white">No payments yet</h2>
          <p className="mb-6 text-center text-gray-600 dark:text-gray-400">
            You don&apos;t have any active payment relationships.
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
        <div className="grid gap-4">
          {paymentSummary?.summarizedPayments.map(({ summary, details }, index) => (
            <div key={index} className="card overflow-hidden border border-gray-100 dark:border-gray-700">
              {/* Payment Summary Card */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                <div className="mb-4 sm:mb-0">
                  {summary.amount === 0 ? (
                    <div className="flex items-center">
                      <div className="mr-3 rounded-full bg-gray-100 p-2 dark:bg-gray-700">
                        <FaUserFriends className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900 dark:text-white">
                          {summary.payerId !== session?.userId
                            ? summary.payerName
                            : summary.participantName}
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          All payments settled
                        </p>
                      </div>
                    </div>
                  ) : summary.payerId === session?.userId ? (
                    <div className="flex items-center">
                      <div className="mr-3 rounded-full bg-green-100 p-2 dark:bg-green-900 dark:bg-opacity-30">
                        <FaUserFriends className="h-5 w-5 text-green-600 dark:text-green-400" />
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900 dark:text-white">
                          {summary.participantName}
                        </h3>
                        <p className="text-sm text-green-600 dark:text-green-400">
                          Owes you {currencyToString(summary.currency)}
                          {summary.amount.toFixed(2)}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center">
                      <div className="mr-3 rounded-full bg-red-100 p-2 dark:bg-red-900 dark:bg-opacity-30">
                        <FaUserFriends className="h-5 w-5 text-red-600 dark:text-red-400" />
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900 dark:text-white">
                          {summary.payerName}
                        </h3>
                        <p className="text-sm text-red-600 dark:text-red-400">
                          You owe {currencyToString(summary.currency)}
                          {summary.amount.toFixed(2)}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="flex items-center space-x-3">
                  {summary.participantId === session?.userId && summary.amount > 0 && (
                    <button
                      onClick={() => {
                        setPaymentDialogOpen(true);
                        setPaymentRecipient({
                          name: summary.payerName,
                          id: summary.payerId,
                        });
                      }}
                      className="inline-flex items-center rounded-md bg-indigo-50 px-3 py-2 text-sm font-medium text-indigo-700 transition-colors hover:bg-indigo-100 dark:bg-indigo-900 dark:bg-opacity-30 dark:text-indigo-400 dark:hover:bg-opacity-50"
                    >
                      <FaMoneyBillWave className="mr-2" />
                      Pay
                    </button>
                  )}
                  <button
                    onClick={() => toggleDropdown(index)}
                    className="inline-flex items-center rounded-md bg-gray-50 px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                  >
                    {openDropdowns[index] ? (
                      <>
                        <span>Hide details</span>
                        <FaChevronUp className="ml-2" />
                      </>
                    ) : (
                      <>
                        <span>Show details</span>
                        <FaChevronDown className="ml-2" />
                      </>
                    )}
                  </button>
                </div>
              </div>
              
              {/* Expanded Details */}
              {openDropdowns[index] && (
                <div className="mt-4 border-t border-gray-100 pt-4 dark:border-gray-700">
                  <h4 className="mb-3 text-sm font-medium text-gray-700 dark:text-gray-300">
                    Transaction History
                  </h4>
                  <div className="space-y-3">
                    {details.map((expense, idx) => (
                      <div
                        key={idx}
                        className="rounded-lg bg-gray-50 p-3 dark:bg-gray-800"
                      >
                        {expense.personalPayment ? (
                          <div className="flex justify-between">
                            <div>
                              <Link
                                href={`view/${expense.paymentId}`}
                                className="font-medium text-gray-900 hover:text-indigo-600 dark:text-white dark:hover:text-indigo-400"
                              >
                                {expense.payerId === session?.userId
                                  ? `You paid ${expense.participantName}`
                                  : `${expense.payerName} paid you`}
                              </Link>
                              <div className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                                Direct payment
                              </div>
                            </div>
                            <div className="text-right">
                              <div className={`font-medium ${
                                expense.payerId === session?.userId
                                  ? "text-red-600 dark:text-red-400"
                                  : "text-green-600 dark:text-green-400"
                              }`}>
                                {expense.payerId === session?.userId ? "-" : "+"}
                                {currencyToString(expense.currency)}
                                {expense.amount.toFixed(2)}
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="flex justify-between">
                            <div>
                              <Link
                                href={`view/${expense.paymentId}`}
                                className="font-medium text-gray-900 hover:text-indigo-600 dark:text-white dark:hover:text-indigo-400"
                              >
                                {expense.description}
                              </Link>
                              <div className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                                {expense.payerId === session?.userId
                                  ? `${expense.participantName} owes you`
                                  : expense.participantId === session?.userId
                                  ? `You owe ${expense.payerName}`
                                  : `${expense.participantName} owes ${expense.payerName}`}
                              </div>
                            </div>
                            <div className="text-right">
                              <div className={`font-medium ${
                                expense.payerId === session?.userId
                                  ? "text-green-600 dark:text-green-400"
                                  : expense.participantId === session?.userId
                                  ? "text-red-600 dark:text-red-400"
                                  : "text-gray-600 dark:text-gray-400"
                              }`}>
                                {expense.payerId === session?.userId ? "+" : expense.participantId === session?.userId ? "-" : ""}
                                {currencyToString(expense.currency)}
                                {expense.amount.toFixed(2)}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
      
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
            if (paymentAmount <= 0) {
              throw new Error("Payment invalid");
            }
            if (!session) {
              throw new Error("User not logged in");
            }
            await createExpense({
              description: `Payment ${session.name} -> ${paymentRecipient.name}`,
              personalPayment: true,
              amount: paymentAmount,
              currency: Currency.GBP,
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
    </div>
  );
};

export default Home;
