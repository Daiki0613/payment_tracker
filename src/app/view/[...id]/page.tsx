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
import Link from "next/link";

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
  const [isDialogOpen, setIsDialogOpen] = useState(false);

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

  if (!session) {
    return <div>Loading...</div>;
  }
  return (
    <>
      <div className="max-w-lg mx-auto p-4 bg-white shadow-md rounded-md">
        <form onSubmit={() => {}}>
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
              disabled
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              required
            />
          </div>

          <div className="mb-4">
            <label
              className="block text-gray-700 text-sm font-bold mb-2"
              htmlFor="amount"
            >
              Total Amount
            </label>
            <input
              id="amount"
              type="number"
              value={amount}
              disabled
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
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              required
              disabled
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
                  disabled
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
                  disabled
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  required
                />
                <input
                  type="string"
                  placeholder="note"
                  value={participant.description}
                  disabled
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                />
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={() => router.push(`/edit/${expenseId}`)}
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline mt-2"
          >
            Edit
          </button>
        </form>
      </div>
    </>
  );
};

export default EditExpenseForm;
