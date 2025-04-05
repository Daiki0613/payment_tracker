"use client";

import { SessionPayload, getSession } from "@/auth/auth";
import { notFound } from "next/navigation";
import {
  ParticipantData,
  deleteExpenseById,
  getExpenseById,
  updateExpenseById,
} from "@/prisma/payments";
import { UserData, getUsers } from "@/prisma/users";
import { useRouter, useSearchParams } from "next/navigation";
import React, { useEffect, useState } from "react";
import { MdDelete } from "react-icons/md";
import ConfirmationDialog from "@/components/ConfirmationDialog";
import { Currency } from "@prisma/client";

interface EditExpenseFormProps {
  params: {
    id: string;
  };
}

const EditExpenseForm: React.FC<EditExpenseFormProps> = ({
  params: { id },
}) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const expenseId = parseInt(id);
  const [session, setSession] = useState<SessionPayload>();
  const [users, setUsers] = useState<UserData[]>([]);
  const [paidBy, setPaidBy] = useState<UserData>({ id: 0, name: "" });
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [currency, setCurrency] = useState<Currency>(Currency.JPY);
  const [participants, setParticipants] = useState<ParticipantData[]>([
    { id: 0, name: "", amountOwed: 0, description: "" },
  ]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadSession = async () => {
      const session = await getSession();
      if (!session) {
        return;
      } else {
        setSession(session);
      }
    };
    loadSession();
  }, []);

  useEffect(() => {
    const fetchUsers = async () => {
      const data = await getUsers();
      setUsers(data);
    };
    fetchUsers();
  }, []);

  useEffect(() => {
    const fetchExpense = async () => {
      if (expenseId) {
        const expense = await getExpenseById(expenseId);
        if (!expense) {
          notFound();
        }
        setDescription(expense.description);
        setAmount(expense.amount.toString());
        setCurrency(expense.currency);
        setPaidBy({ id: expense.paidBy.id, name: expense.paidBy.name });
        const participants: ParticipantData[] = expense.participants.map(
          (participant) => ({
            id: participant.user.id,
            name: participant.user.name,
            amountOwed: participant.amountOwed,
            description: participant.description,
          })
        );
        setParticipants(participants);
      }
    };
    fetchExpense();
  }, [expenseId]);

  const handleAddParticipant = () => {
    setParticipants([
      ...participants,
      { id: 0, name: "", amountOwed: 0, description: "" },
    ]);
  };

  const handleParticipantChange = (
    index: number,
    field: keyof ParticipantData,
    value: any
  ) => {
    if (field === "name") {
      const selectedUser = users.find((user) => user.name === value);
      if (!selectedUser) {
        return;
      }
      const newParticipants = [...participants];
      newParticipants[index] = {
        ...newParticipants[index],
        id: selectedUser.id,
        name: selectedUser.name,
      };
      setParticipants(newParticipants);
    } else if (field === "amountOwed") {
      const amount = parseFloat(value);
      const newParticipants = [...participants];
      newParticipants[index] = {
        ...newParticipants[index],
        amountOwed: amount,
      };
      setParticipants(newParticipants);
    } else {
      const newParticipants = [...participants];
      newParticipants[index] = {
        ...newParticipants[index],
        [field]: value,
      };
      setParticipants(newParticipants);
    }
  };

  const handleDeleteParticipant = (index: number) => {
    const newParticipants = participants.filter((_, i) => i !== index);
    setParticipants(newParticipants);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmount = parseFloat(amount);
    if (parsedAmount <= 0 || parsedAmount > 5000) {
      setError("Please make the values greater than 0");
      return;
    }

    try {
      setParticipants(participants.filter((p) => p.name !== ""));
      if (participants.some((p) => p.amountOwed <= 0)) {
        setError("Each participant's amount owed must be greater than 0");
        return;
      }
      const total = participants.reduce((acc, p) => acc + p.amountOwed, 0);
      if (total < parsedAmount - 0.1 || parsedAmount + 0.1 < total) {
        setError("Total amount does not match");
        return;
      }
      const response = await updateExpenseById(expenseId, {
        description: description,
        amount: parsedAmount,
        currency: currency,
        paidById: paidBy?.id,
        participants: participants,
      });
      if (!response) {
        setError("Something went wrong");
        console.log("Failed to update expense");
        return;
      } else {
        router.push("/");
      }
    } catch {
      console.log("Failed to update expense");
    }
  };

  // const handleDelete = async () => {
  //   const confirmed = window.confirm(
  //     "Are you sure you want to delete this expense?"
  //   );
  //   if (confirmed) {
  //     try {
  //       await deleteExpenseById(expenseId);
  //       router.push("/");
  //     } catch {
  //       console.log("Failed to delete expense");
  //     }
  //   }
  // };

  const handlePaidByChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedUser = users.find((user) => user.name === e.target.value);
    if (!selectedUser) {
      setPaidBy({ id: 0, name: "" });
    } else {
      setPaidBy(selectedUser);
    }
  };

  const handleAddEveryone = () => {
    const newParticipants = users.map((user) => ({
      id: user.id,
      name: user.name,
      amountOwed: 0,
      description: "",
    }));
    setParticipants(newParticipants);
  };

  const handleSplitEqually = () => {
    // Function to shuffle array (Fisher-Yates shuffle)
    function shuffleArray(array: any[]) {
      const shuffledArray = [...array];
      for (let i = shuffledArray.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffledArray[i], shuffledArray[j]] = [
          shuffledArray[j],
          shuffledArray[i],
        ];
      }
      return shuffledArray;
    }
    // Filter out participants who have names (assuming `participants` is an array of objects with a `name` field)
    const filteredParticipants = participants.filter((p) => p.name !== "");
    const length = filteredParticipants.length;

    if (length === 0) {
      return;
    }

    const intAmount = Math.round(parseFloat(amount) * 100);
    // Calculate base payment and remainder
    const basePayment = Math.floor(intAmount / length); // Allow decimal division for exact amounts
    const remainder = intAmount - basePayment * length;
    console.log(remainder);

    // Shuffle participants array to randomize who pays more or less
    const shuffledParticipants = shuffleArray(filteredParticipants);

    // Initialize array to hold exact amounts owed
    const exactPayments = new Array(length).fill(basePayment); // Round to two decimal places

    // Distribute remainder randomly
    for (let i = 0; i < remainder; i++) {
      exactPayments[i] += 1; // Adjust for 0.01 pounds precision
    }

    // Update participants with exact amounts owed (using shuffled order)
    const newParticipants = participants.map((participant, index) => {
      const shuffledIndex = shuffledParticipants.findIndex(
        (p) => p === participant
      );
      if (participant.name !== "") {
        return {
          ...participant,
          amountOwed: parseFloat(
            (exactPayments[shuffledIndex] / 100).toFixed(2)
          ),
        };
      } else {
        return participant; // Maintain participants without names (if any)
      }
    });

    // Set state with updated participants
    setParticipants(newParticipants);
  };

  if (!session) {
    return <div>Loading...</div>;
  }
  return (
    <>
      <div className="max-w-lg mx-auto p-4 bg-white shadow-md rounded-md">
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label
              className="block text-gray-700 text-sm font-bold mb-2"
              htmlFor="description"
            >
              Description
            </label>
            <input
              id="description"
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              required
            />
          </div>

          <div className="mb-4">
            <label
              className="block text-gray-700 text-sm font-bold mb-2"
              htmlFor="amount"
            >
              Amount
            </label>
            <div className="flex justify-between">
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value as Currency)}
                className="shadow appearance-none border rounded w-1/6 py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              >
                {Object.values(Currency).map((currency) => (
                  <option key={currency} value={currency}>
                    {currency}
                  </option>
                ))}
              </select>
              <input
                id="amount"
                type="number"
                value={amount}
                onChange={(e) => {
                  setAmount(e.target.value);
                }}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                required
              />
            </div>
          </div>

          <div className="mb-4">
            <label
              className="block text-gray-700 text-sm font-bold mb-2"
              htmlFor="paidBy"
            >
              Paid By
            </label>
            <select
              id="paidBy"
              value={paidBy?.name}
              onChange={handlePaidByChange}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              required
            >
              {users.map((user) => (
                <option key={user.id} value={user.name}>
                  {user.name}
                </option>
              ))}
            </select>
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Participants
            </label>
            {error && <p className="text-red-500 mb-4">{error}</p>}
            {participants.map((participant, index) => (
              <div key={index} className="mb-2 flex">
                <select
                  value={participant.name}
                  onChange={(e) =>
                    handleParticipantChange(index, "name", e.target.value)
                  }
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline mr-2"
                >
                  <option value="">Select Participant</option>
                  {users.map((user) => (
                    <option
                      key={user.id}
                      value={user.name}
                      disabled={participants.some(
                        (p) =>
                          p.name === user.name && p.name !== participant.name
                      )}
                    >
                      {user.name}
                    </option>
                  ))}
                </select>
                <input
                  type="number"
                  placeholder="Amount Owed"
                  value={participant.amountOwed}
                  onChange={(e) =>
                    handleParticipantChange(index, "amountOwed", e.target.value)
                  }
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  required
                />
                <input
                  type="string"
                  placeholder="note"
                  value={participant.description}
                  onChange={(e) =>
                    handleParticipantChange(
                      index,
                      "description",
                      e.target.value
                    )
                  }
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                />
                <button
                  type="button"
                  onClick={() => handleDeleteParticipant(index)}
                  className="px-1"
                >
                  <MdDelete className="text-red-500" />
                </button>
              </div>
            ))}

            <div className="flex justify-between">
              <button
                type="button"
                onClick={handleAddParticipant}
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline mt-4"
              >
                Add Participant
              </button>
              <button
                type="button"
                onClick={handleAddEveryone}
                className="bg-gray-400 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline mt-4"
              >
                Add Everyone
              </button>
              <button
                type="button"
                onClick={handleSplitEqually}
                className="bg-gray-400 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline mt-4"
              >
                Split Equally
              </button>
            </div>
          </div>

          <div className="flex justify-between">
            <div className="flex items-center justify-between">
              <button
                type="submit"
                className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
              >
                Update Expense
              </button>
            </div>
            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={() => setIsDialogOpen(true)}
                className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
              >
                Delete Expense
              </button>
            </div>
          </div>
        </form>
      </div>
      <ConfirmationDialog
        isOpen={isDialogOpen}
        onConfirm={async () => {
          try {
            await deleteExpenseById(expenseId);
            router.push("/");
          } catch {
            console.log("Failed to delete expense");
          }
        }}
        onCancel={() => setIsDialogOpen(false)}
        message="Are you sure you want to delete?"
      />
    </>
  );
};

export default EditExpenseForm;
