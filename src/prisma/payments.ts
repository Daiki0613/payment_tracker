"use server";

import { Prisma } from "@prisma/client";
import prisma from "./connect";
import { getUsers } from "./users";

// const userData = Prisma.validator<Prisma.UserDefaultArgs>()({
//   select: {
//     id: true,
//     name: true,
//   },
// });

// export type UserData = Prisma.UserGetPayload<typeof userData>;

export interface ParticipantData {
  id: number;
  name: string;
  amountOwed: number;
  description: string;
}

export interface ExpenseData {
  description: string;
  amount: number;
  paidById: number;
  participants: ParticipantData[];
}

export const createExpense = async (expenseData: ExpenseData) => {
  const expense = await prisma.expense.create({
    data: {
      description: expenseData.description,
      amount: expenseData.amount,
      paidBy: {
        connect: {
          id: expenseData.paidById,
        },
      },
      participants: {
        create: expenseData.participants.map((participant) => ({
          user: { connect: { id: participant.id } },
          amountOwed: participant.amountOwed,
          description: participant.description,
        })),
      },
    },
  });
  return expense;
};

export type ExpensesWithParticipants = Awaited<ReturnType<typeof getExpenses>>;

export const getExpenses = async () => {
  return await prisma.expense.findMany({
    include: {
      paidBy: true,
      participants: {
        include: {
          user: true,
        },
      },
    },
  });
};

export const getExpenseById = async (id: number) => {
  return await prisma.expense.findFirst({
    where: {
      id: id,
    },
    include: {
      paidBy: true,
      participants: {
        include: {
          user: true,
        },
      },
    },
  });
};

export const updateExpenseById = async (
  id: number,
  expenseData: ExpenseData
) => {
  const expense = await prisma.expense.update({
    where: {
      id: id,
    },
    data: {
      description: expenseData.description,
      amount: expenseData.amount,
      paidBy: {
        connect: {
          id: expenseData.paidById,
        },
      },
      participants: {
        deleteMany: {},
        create: expenseData.participants.map((participant) => ({
          user: { connect: { id: participant.id } },
          amountOwed: participant.amountOwed,
          description: participant.description,
        })),
      },
    },
  });
  return expense;
};

export const deleteExpenseById = async (id: number) => {
  return await prisma.expense.delete({
    where: {
      id: id,
    },
  });
};

export const getExpenseParticipantByUserId = async (userId: number) => {
  return await prisma.expense.findMany({
    where: {
      participants: {
        some: {
          userId: userId,
        },
      },
    },
    include: {
      paidBy: true,
      participants: {
        include: {
          user: true,
        },
      },
    },
  });
};

export const getPaidExpensesByUserId = async (userId: number) => {
  return await prisma.expense.findMany({
    where: {
      paidById: userId,
    },
    include: {
      paidBy: true,
      participants: {
        include: {
          user: true,
        },
      },
    },
  });
};

export interface PaymentSummary {
  totalExpense: number;
  totalPaid: number;
  totalOwed: number;

  summarizedPayments: Payment[];
  allTransactions: Payment[];
}

export interface Payment {
  payerId: number;
  payerName: string;
  participantId: number;
  participantName: string;
  amount: number;
  description: string;
}

const summarizePayments = (payments: Payment[]): Payment[] => {
  let summary: { [key: string]: Payment } = {};

  payments.forEach((payment) => {
    if (payment.payerId === payment.participantId) {
      return; // Skip self payments
    }
    let key1 = `${payment.payerId}-${payment.participantId}`;
    let key2 = `${payment.participantId}-${payment.payerId}`;

    if (summary[key1]) {
      summary[key1].amount += payment.amount;
    } else if (summary[key2]) {
      summary[key2].amount -= payment.amount; // Adjust for opposite direction
      if (summary[key2].amount === 0) {
        delete summary[key2]; // Remove if net amount is zero
      }
    } else {
      summary[key1] = {
        payerId: payment.payerId,
        payerName: payment.payerName,
        participantId: payment.participantId,
        participantName: payment.participantName,
        amount: payment.amount,
        description: payment.description,
      };
    }
  });

  let summarizedPayments: Payment[] = Object.values(summary);
  summarizedPayments.forEach((payment) => {
    if (payment.amount < 0) {
      let tempId = payment.payerId;
      let tempName = payment.payerName;
      payment.payerId = payment.participantId;
      payment.payerName = payment.participantName;
      payment.participantId = tempId;
      payment.participantName = tempName;
      payment.amount = -payment.amount;
    }
    payment.amount = Math.round(payment.amount * 100) / 100;
  });

  return summarizedPayments;
};

export const getPaymentSummary = async (
  userId: number
): Promise<PaymentSummary> => {
  // Fetch all expenses where the user is the payer
  const paidExpenses = await prisma.expense.findMany({
    include: {
      paidBy: true,
      participants: {
        include: {
          user: true,
        },
      },
    },
  });

  const payments: Payment[] = paidExpenses.flatMap((expense) =>
    expense.participants.map((participant) => ({
      payerId: expense.paidBy.id,
      payerName: expense.paidBy.name,
      participantId: participant.user.id,
      participantName: participant.user.name,
      amount: participant.amountOwed,
      description: participant.description
        ? expense.description + " - " + participant.description
        : expense.description,
    }))
  );

  const allUserTransactions: Payment[] = payments.filter(
    (payment) => payment.payerId === userId || payment.participantId === userId
  );

  const summarizedPayments: Payment[] = summarizePayments(allUserTransactions);

  return {
    totalExpense: 0,
    totalPaid: 0,
    totalOwed: 0,
    allTransactions: allUserTransactions,
    summarizedPayments: summarizedPayments,
  };
};
