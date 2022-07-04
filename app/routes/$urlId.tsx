import type { RedirectUrl } from "@prisma/client";
import type { LoaderFunction } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import { Link } from "@remix-run/react";
import { prisma } from "~/server/prisma.server";

export const reduceCount = async (
  urlId: string,
  oldRedirectUrl: RedirectUrl
) => {
  try {
    if (oldRedirectUrl.visitorsAllowed === 1) {
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
    return null;
  }

  const redirectUrl = dbResponse.redirectUrl;

  if (dbResponse.visitorsAllowed <= 0) {
    return null;
  } else {
    reduceCount(urlId, dbResponse);
    return redirect(redirectUrl);
  }
};

export default function () {
  return (
    <div className="grid place-items-center min-h-screen">
      <div className="flex flex-col gap-y-6 bg-white p-10 rounded-md max-w-[50%]">
        <h1 className="font-semibold text-2xl underline underline-offset-1">
          It seems you are late !
        </h1>
        <p>
          Either provided url is not valid or number of visitors allowed has
          been exceeded. Do you want to go home page
        </p>
        <div>
          <Link
            to="/"
            className="bg-blue-500 hover:bg-blue-700 ease-in duration-200 text-white px-3 py-2 rounded-md"
          >
            Go to Homepage
          </Link>
        </div>
      </div>
    </div>
  );
}
