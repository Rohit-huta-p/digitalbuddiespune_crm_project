import CustomCalendar from "@/components/calendar/calendar";
import React from "react";

const Page = () => {
  return (
    <section className="w-full h-auto flex flex-col px-3 md:px-12 py-5">
      <CustomCalendar className="mt-16" />
    </section>
  );
};

export default Page;
