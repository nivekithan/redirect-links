import type { ActionFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Form, useActionData } from "@remix-run/react";
import { prisma } from "~/server/prisma.server";
import { nanoid } from "nanoid";
import { useState } from "react";

const getValidUrl = (mayBeUrl: string) => {
  try {
    const url = new URL(mayBeUrl);
    return url;
  } catch (err) {
    return null;
  }
};

type ActionData = {
  errorMsg?: string;
  newUrl?: string;
};

const badRequest = (message: string) => {
  return json<ActionData>({ errorMsg: message }, { status: 400 });
};

const serverError = (message: string) => {
  return json<ActionData>({ errorMsg: message }, { status: 500 });
};

export const action: ActionFunction = async ({ request }) => {
  try {
    const formData = await request.formData();

    const redirectUrl = formData.get("redirectUrl");
    const visitorsAllowed = formData.get("visitorsAllowed");

    if (redirectUrl === null || typeof redirectUrl !== "string")
      return badRequest("Redirect url is not valid");

    if (visitorsAllowed === null || typeof visitorsAllowed !== "string")
      return badRequest("VisitorsAllowed is not valid");

    const noOfVistorsAllowed = parseInt(visitorsAllowed, 10);

    if (Number.isNaN(noOfVistorsAllowed))
      return badRequest("VisitorsAllowed is not valid");

    if (getValidUrl(redirectUrl) === null)
      return badRequest("Redirect url is not valid");

    const urlId = nanoid();

    await prisma.redirectUrl.create({
      data: {
        redirectUrl: redirectUrl,
        visitorsAllowed: noOfVistorsAllowed,
        urlId: urlId,
      },
    });

    const newUrl = `${request.url}${urlId}`;

    return json<ActionData>({ newUrl: newUrl });
  } catch (err) {
    console.log(err);
    return serverError("Something wrong happened with server please try again");
  }
};

export default function Index() {
  const actionData = useActionData<ActionData>();

  return (
    <div className="grid place-items-center min-h-screen">
      <div className="flex flex-col gap-y-6 bg-white p-10 rounded-md">
        <Form method="post">
          <div className="flex flex-col gap-y-3">
            <label htmlFor="redirectUrl" className="font-semibold">
              Url you wish to redirect
            </label>
            <input
              name="redirectUrl"
              id="redirectUrl"
              type="url"
              className="border border-blue-300 rounded-md px-3 py-1 w-60"
            />
            <label htmlFor="visitorsAllowed" className="font-semibold">
              Number of visitors allowed
            </label>
            <input
              name="visitorsAllowed"
              id="visitorsAllowed"
              type="number"
              className="border border-blue-300 rounded-md px-3 py-1"
              defaultValue={20}
            />
            <button
              type="submit"
              className="text-white bg-blue-500 hover:bg-blue-700 ease-out duration-200 px-3 py-2 rounded-md"
            >
              Get your url
            </button>
          </div>
        </Form>
        <GeneratedUrl url={actionData?.newUrl} />
      </div>
    </div>
  );
}

type GeneratedUrlProps = {
  url?: string;
};

const GeneratedUrl = ({ url }: GeneratedUrlProps) => {
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);

  if (url === undefined) return null;

  const copyUrl = async () => {
    await navigator.clipboard.writeText(url);
  };

  if (globalThis.window && (copiedUrl === null || copiedUrl !== url)) {
    setCopiedUrl(url);
    copyUrl();
  }

  return (
    <div className="flex flex-col gap-y-3">
      <div className="border-t border-gray-500"></div>
      <div className="flex gap-x-2 items-center">
        <label htmlFor="generatedUrl" className="font-semibold">
          Generated Url
        </label>
        <button
          type="button"
          className="px-2 py-1 bg-green-300 ease-out duration-200 rounded-md hover:bg-green-400"
          onClick={copyUrl}
        >
          Copy Url
        </button>
      </div>
      <input
        type="url"
        readOnly
        value={url}
        id="generatedUrl"
        className="border border-blue-300 rounded-md px-3 py-1 w-60"
      />
    </div>
  );
};
