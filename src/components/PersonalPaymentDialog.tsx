import React, { useState } from "react";
import { FaYenSign } from "react-icons/fa";

interface ConfirmationDialogProps {
  error: string | null;
  isOpen: boolean;
  user: { name: string; id: number };
  amount: number;
  setAmount: (amount: number) => void;
  onConfirm: () => void;
  onCancel: () => void;
}

const PaymentDialog: React.FC<ConfirmationDialogProps> = ({
  error,
  isOpen,
  user,
  amount,
  setAmount,
  onConfirm,
  onCancel,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm transition-opacity">
      <div className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all dark:bg-gray-800">
        <h3 className="text-lg font-medium leading-6 text-gray-900 dark:text-white">
          Make Payment
        </h3>
        <div className="mt-2">
          <p className="text-sm text-gray-500 dark:text-gray-300">
            You are sending money to <span className="font-medium text-gray-700 dark:text-gray-200">{user.name}</span>
          </p>
        </div>
        {error && (
          <div className="mt-3 rounded-md bg-red-50 p-3 dark:bg-red-900 dark:bg-opacity-20">
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          </div>
        )}
        <div className="mt-4">
          <label htmlFor="amount" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Amount (JPY)
          </label>
          <div className="relative mt-1 rounded-md shadow-sm">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <FaYenSign className="h-4 w-4 text-gray-400" />
            </div>
            <input
              type="number"
              id="amount"
              value={amount}
              onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
              className="block w-full rounded-md border-gray-300 pl-10 pr-4 py-2 focus:border-indigo-500 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              placeholder="0.00"
              step="0.01"
              min="0"
            />
          </div>
        </div>
        <div className="mt-6 flex justify-end space-x-3">
          <button
            onClick={onCancel}
            className="inline-flex justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm transition-colors hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="inline-flex justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          >
            Send Payment
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaymentDialog;
