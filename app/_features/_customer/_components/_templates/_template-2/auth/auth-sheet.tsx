"use client";

import * as VisuallyHidden from "@radix-ui/react-visually-hidden";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { User } from "lucide-react";
import { SignInForm } from "./sign-in-form";
import { SignUpForm } from "./sign-up-form";

export const AuthSheet = () => {
  return (
    <Sheet>
      <SheetTrigger>
        <User />
      </SheetTrigger>
      <SheetContent side="bottom" className="h-[400px]">
        <SheetHeader>
          <VisuallyHidden.Root>
            <SheetTitle>Are you absolutely sure?</SheetTitle>
          </VisuallyHidden.Root>
          <VisuallyHidden.Root>
            <SheetDescription>
              This action cannot be undone. This will permanently delete your
              account and remove your data from our servers.
            </SheetDescription>
          </VisuallyHidden.Root>
        </SheetHeader>
        <div className="flex mt-4 h-full">
          <div className="flex justify-center w-full border-r">
            <SignInForm />
          </div>
          <div className="flex justify-center w-full">
            <SignUpForm />
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};
