import { PrototypeRoot } from '@proto/kit';
import { View } from '@vkontakte/vkui';
import { Agentation } from 'agentation';
import { DocumentsPanel } from './screens/DocumentsPanel';
import './fonts.css';
import './agentation.css';

export function App() {
  // Один экран: hero-разворот делаем «на месте» состоянием, без push-перехода View.
  return (
    <>
      <PrototypeRoot target="adaptive" platform="vkcom">
        <View activePanel="documents">
          <DocumentsPanel nav="documents" />
        </View>
      </PrototypeRoot>
      {/* Dev-only фидбек-тулбар agentation (на пробе). В прод не попадает. */}
      {import.meta.env.DEV && <Agentation className="agentation-tl" />}
    </>
  );
}
