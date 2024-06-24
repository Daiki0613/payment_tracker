import React, { useState } from "react";

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
    <div className="fixed inset-0 flex items-center justify-center bg-gray-500 bg-opacity-75">
      <div className="bg-white dark:bg-gray-800 rounded-md p-4 shadow-lg">
        <p className="mb-4">Paying to {user.name}</p>
        {error && <p className="text-red-500 mb-4">{error}</p>}
        <div className="mb-4">
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(parseFloat(e.target.value))}
            className="w-full rounded-md border border-gray-300 p-2 dark:bg-gray-700 dark:border-gray-600"
            placeholder="Enter amount"
          />
        </div>
        <div className="flex justify-end">
          <button
            onClick={onCancel}
            className="mr-2 rounded-md px-4 py-2 bg-gray-300 hover:bg-gray-400 dark:bg-gray-700 dark:hover:bg-gray-600"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="rounded-md px-4 py-2 bg-green-500 hover:bg-green-600 text-white"
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaymentDialog;
