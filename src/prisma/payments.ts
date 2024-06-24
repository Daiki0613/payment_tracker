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
  personalPayment?: boolean;
  participants: ParticipantData[];
}

export const createExpense = async (expenseData: ExpenseData) => {
  const expense = await prisma.expense.create({
    data: {
      description: expenseData.description,
      personalPayment: expenseData.personalPayment,
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
    orderBy: {
      createdAt: "desc",
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
  try {
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
  } catch (e) {
    console.log(e);
  }
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

  summarizedPayments: {
    summary: Payment;
    details: Payment[];
  }[];
}

export interface Payment {
  payerId: number;
  payerName: string;
  participantId: number;
  participantName: string;
  amount: number;
  personalPayment?: boolean;
  paymentId?: number;
  description: string;
}

const summarizePayments = (
  payments: Payment[]
): { summary: Payment; details: Payment[] }[] => {
  let summary: { [key: string]: { summary: Payment; details: Payment[] } } = {};

  payments.forEach((payment) => {
    if (payment.payerId === payment.participantId) {
      return; // Skip self payments
    }
    let key1 = `${payment.payerId}-${payment.participantId}`;
    let key2 = `${payment.participantId}-${payment.payerId}`;

    if (summary[key1]) {
      summary[key1].summary.amount += payment.amount;
      summary[key1].details.push(payment);
    } else if (summary[key2]) {
      summary[key2].summary.amount -= payment.amount; // Adjust for opposite direction
      summary[key2].details.push(payment);
    } else {
      summary[key1] = {
        summary: {
          payerId: payment.payerId,
          payerName: payment.payerName,
          participantId: payment.participantId,
          participantName: payment.participantName,
          amount: payment.amount,
          description: payment.description,
        },
        details: [payment],
      };
    }
  });

  let summarizedPayments: { summary: Payment; details: Payment[] }[] =
    Object.values(summary);
  summarizedPayments.forEach((payment) => {
    if (payment.summary.amount < 0) {
      let tempId = payment.summary.payerId;
      let tempName = payment.summary.payerName;
      payment.summary.payerId = payment.summary.participantId;
      payment.summary.payerName = payment.summary.participantName;
      payment.summary.participantId = tempId;
      payment.summary.participantName = tempName;
      payment.summary.amount = -payment.summary.amount;
    }
    payment.summary.amount = Math.round(payment.summary.amount * 100) / 100;
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
      personalPayment: expense.personalPayment,
      paymentId: expense.id,
      description: participant.description
        ? expense.description + " - " + participant.description
        : expense.description,
    }))
  );

  const allUserTransactions: Payment[] = payments.filter(
    (payment) => payment.payerId === userId || payment.participantId === userId
  );

  const summarizedPayments = summarizePayments(allUserTransactions);

  return {
    totalExpense: 0,
    totalPaid: 0,
    totalOwed: 0,
    summarizedPayments: summarizedPayments,
  };
};
