import { AppCanvas } from "./components/AppCanvas";
import { sampleVideos } from "./data/sample-videos";

export default function Home() {
  return <AppCanvas videos={sampleVideos} />;
}
