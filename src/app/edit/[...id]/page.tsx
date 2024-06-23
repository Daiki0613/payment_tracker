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
  const [amount, setAmount] = useState(0);
  const [participants, setParticipants] = useState<ParticipantData[]>([
    { id: 0, name: "", amountOwed: 0, description: "" },
  ]);

  useEffect(() => {
    const loadSession = async () => {
      const session = await getSession();
      if (!session) {
        router.push("/");
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
        setAmount(expense.amount);
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
      return;
    }

    const newParticipants = [...participants];
    newParticipants[index] = {
      ...newParticipants[index],
      [field]: value,
    };
    setParticipants(newParticipants);
  };

  const handleDeleteParticipant = (index: number) => {
    const newParticipants = participants.filter((_, i) => i !== index);
    setParticipants(newParticipants);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await updateExpenseById(expenseId, {
        description: description,
        amount: amount,
        paidById: paidBy?.id,
        participants: participants,
      });
      router.push("/");
    } catch {
      console.log("Failed to update expense");
    }
  };

  const handleDelete = async () => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this expense?"
    );
    if (confirmed) {
      try {
        await deleteExpenseById(expenseId);
        router.push("/");
      } catch {
        console.log("Failed to delete expense");
      }
    }
  };

  const handlePaidByChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedUser = users.find((user) => user.name === e.target.value);
    if (!selectedUser) {
      setPaidBy({ id: 0, name: "" });
    } else {
      setPaidBy(selectedUser);
    }
  };

  if (!session) {
    return <div>Loading...</div>;
  }
  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-lg mx-auto p-4 bg-white shadow-md rounded-md"
    >
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
        <input
          id="amount"
          type="number"
          value={amount}
          onChange={(e) => setAmount(parseFloat(e.target.value))}
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          required
        />
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
                    (p) => p.name === user.name && p.name !== participant.name
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
                handleParticipantChange(
                  index,
                  "amountOwed",
                  parseFloat(e.target.value)
                )
              }
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              required
            />
            <input
              type="string"
              placeholder="note"
              value={participant.description}
              onChange={(e) =>
                handleParticipantChange(index, "description", e.target.value)
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
        <button
          type="button"
          onClick={handleAddParticipant}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
        >
          Add Participant
        </button>
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
            onClick={async () => {
              const confirmed = window.confirm(
                "Are you sure you want to delete this expense?"
              );
              if (confirmed) {
                try {
                  await deleteExpenseById(expenseId);
                  router.push("/");
                } catch {
                  console.log("Failed to delete expense");
                }
              }
            }}
            className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
          >
            Delete Expense
          </button>
        </div>
      </div>
    </form>
  );
};

export default EditExpenseForm;
