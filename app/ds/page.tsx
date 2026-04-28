import DsClient from "./DsClient"

export const metadata = {
    title: "Danh sach (DS)",
}

export default function Page() {
    return (
        <section className="motion-rise w-full">
            <h2 className="mb-4 text-2xl font-semibold">Danh sach (DS)</h2>
            <DsClient />
        </section>
    )
}
