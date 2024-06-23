"use server";

import { Prisma } from "@prisma/client";
import prisma from "./connect";

const userData = Prisma.validator<Prisma.UserDefaultArgs>()({
  select: {
    id: true,
    name: true,
  },
});

export type UserData = Prisma.UserGetPayload<typeof userData>;

export const getUsers = async () => {
  return await prisma.user.findMany({
    select: {
      id: true,
      name: true,
    },
  });
};

export const getUserById = async (id: number) => {
  return await prisma.user.findUnique({
    where: {
      id: id,
    },
    select: {
      id: true,
      name: true,
    },
  });
};

export const getUserByName = async (name: string) => {
  return await prisma.user.findUnique({
    where: {
      name: name,
    },
    select: {
      id: true,
      name: true,
    },
  });
};
