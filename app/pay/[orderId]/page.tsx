import PayClient from "./pay-client";

type PayPageProps = {
  params: Promise<{ orderId: string }>;
};

export default async function PayPage({ params }: PayPageProps) {
  const { orderId } = await params;
  return <PayClient orderId={orderId} />;
}
