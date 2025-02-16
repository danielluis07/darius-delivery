import { NewOrderSkeleton } from "@/components/skeletons/new-order";

const Loading = () => {
  return (
    <div className="pt-20">
      <NewOrderSkeleton />;
    </div>
  );
};

export default Loading;
