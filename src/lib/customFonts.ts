import localFont from "next/font/local";

// const IndieFlower = localFont({
//   src: [{ path: "../assets/fonts/indieflower/IndieFlower-Regular.ttf" }],
//   variable: "--font-indieflower",
// });
const SourGummy = localFont({
  src: [
    {
      path: "../assets/fonts/SourGummy-Thin.ttf",
      weight: "200",
      style: "normal",
    },
    {
      path: "../assets/fonts/SourGummy-ExtraLight.ttf",
      weight: "200",
      style: "normal",
    },
    {
      path: "../assets/fonts/SourGummy-Light.ttf",
      weight: "300",
      style: "normal",
    },
    {
      path: "../assets/fonts/SourGummy-Regular.ttf",
      weight: "400",
      style: "normal",
    },
    {
      path: "../assets/fonts/SourGummy-Medium.ttf",
      weight: "500",
      style: "normal",
    },
    {
      path: "../assets/fonts/SourGummy-SemiBold.ttf",
      weight: "600",
      style: "normal",
    },
    {
      path: "../assets/fonts/SourGummy-Bold.ttf",
      weight: "700",
      style: "normal",
    },
    {
      path: "../assets/fonts/SourGummy-ExtraBold.ttf",
      weight: "800",
      style: "normal",
    },
    {
      path: "../assets/fonts/SourGummy-Black.ttf",
      weight: "900",
      style: "normal",
    },
  ],
  variable: "--font-sour-gummy",
});

export { SourGummy };
