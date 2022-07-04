import type { RedirectUrl } from "@prisma/client";
import type { LoaderFunction } from "@remix-run/node";
import {  redirect } from "@remix-run/node";
import { prisma } from "~/server/prisma.server";

export const reduceCount = async (
  urlId: string,
  oldRedirectUrl: RedirectUrl
) => {
  try {
    const allowedCount = oldRedirectUrl.visitorsAllowed;

    if (allowedCount < 2) {
      await prisma.redirectUrl.delete({ where: { urlId: urlId } });
      return;
    }

    await prisma.redirectUrl.update({
      data: {
        visitorsAllowed: {
          decrement: 1,
        },
      },
      where: {
        urlId: urlId,
      },
    });
  } catch (err) {
    // Who cares if this function fails
    return;
  }
};

export const loader: LoaderFunction = async ({ params }) => {
  const urlId = params.urlId;

  if (urlId === undefined) throw new Error("Expected urlId to be name of file");

  const dbResponse = await prisma.redirectUrl.findFirst({
    where: { urlId: urlId },
  });

  if (dbResponse === null) {
    return redirect("/");
  }

  const redirectUrl = dbResponse.redirectUrl;
  reduceCount(urlId, dbResponse);
  return redirect(redirectUrl);
};

export default function () {
  return <div>HI theer</div>;
}
