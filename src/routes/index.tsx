import { createFileRoute } from "@tanstack/react-router";
import { BachpanSeApp } from "@/screens/bachpanse/app";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "BachpanSe — Interactive Prototype" },
      {
        name: "description",
        content:
          "Clickable high-fidelity prototype of BachpanSe, a financial learning and money management app for children aged 10–17 and their parents in India. Demo data only.",
      },
      { property: "og:title", content: "BachpanSe — Interactive Prototype" },
      {
        property: "og:description",
        content:
          "Learn money the fun way — a clickable mobile prototype for kids and parents in India.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: BachpanSeApp,
});
