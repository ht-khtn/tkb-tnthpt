import TkbClient from "./TkbClient";

export const metadata = {
    title: "TKB",
};

export default function Page() {
    return (
        <section className="motion-rise w-full">
            <h2 className="mb-4 text-2xl font-semibold">Thời khóa biểu</h2>
            <TkbClient />
        </section>
    );
}
