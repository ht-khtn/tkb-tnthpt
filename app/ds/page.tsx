import DsClient from "./DsClient"

export const metadata = {
    title: "DS",
}

export default function Page() {
    return (
        <section className="motion-rise w-full">
            <h2 className="mb-4 text-2xl font-semibold">Danh sách</h2>
            <DsClient />
        </section>
    )
}
