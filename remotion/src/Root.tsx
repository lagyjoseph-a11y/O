import { Composition, staticFile } from "remotion";
import {
  CaptionedVideo,
  calculateCaptionedVideoMetadata,
  captionedVideoSchema,
} from "./CaptionedVideo";
import { ChessLesson } from "./ChessLesson";
import { LESSONS } from "./ChessLesson/lessons";

// Each <Composition> is an entry in the sidebar!

export const RemotionRoot: React.FC = () => {
  return (
    <>
      {Object.keys(LESSONS).map((id) => (
        <Composition
          key={id}
          id={`Gambit-${id}`}
          component={ChessLesson}
          fps={30}
          width={1080}
          height={1920}
          durationInFrames={Math.ceil(LESSONS[id].durationS * 30)}
          defaultProps={{ lessonId: id }}
        />
      ))}
      <Composition
        id="CaptionedVideo"
        component={CaptionedVideo}
        calculateMetadata={calculateCaptionedVideoMetadata}
        schema={captionedVideoSchema}
        width={1080}
        height={1920}
        defaultProps={{
          src: staticFile("sample-video.mp4"),
        }}
      />
    </>
  );
};
