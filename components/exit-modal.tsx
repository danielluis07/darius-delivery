"use client";

import { SyncLoader } from "react-spinners";

export const ExitModal = ({ isExiting }: { isExiting: boolean }) => {
  if (!isExiting) return null;
  return (
    <div className="fixed flex justify-center items-center h-full inset-0 z-50 bg-black/80">
      <SyncLoader color="#001f3f" />
    </div>
  );
};
