import { Composition } from 'remotion';
import { HoroscopoProps, HoroscopoVideo } from './MyVideo';

const defaultProps: HoroscopoProps = {
  signo: 'Escorpiao',
  previsao: 'Os astros estão a alinhar-se a seu favor hoje no SidusAstro.',
  imagemFundoUrl:
    'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c3/NGC_604.jpg/1080px-NGC_604.jpg',
  musicaFundoArquivo: 'musica-peixes.mp3',
  duracaoFrames: 600,
};

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="HoroscopoComposition"
        // eslint-disable-next-line @typescript-eslint/no-explicit-any -- compatibilidade Remotion v4 props tipadas
        component={HoroscopoVideo as any}
        durationInFrames={600}
        fps={30}
        width={1080}
        height={1920}
        defaultProps={defaultProps}
        calculateMetadata={({ props }) => ({
          durationInFrames: Number(props.duracaoFrames) || 600,
        })}
      />
    </>
  );
};
