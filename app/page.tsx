import { AppCanvas } from "./components/canvas/AppCanvas";
import { sampleCovers } from "./data/sample-covers";

export default function Home() {
  return <AppCanvas initialCovers={sampleCovers} />;
}
