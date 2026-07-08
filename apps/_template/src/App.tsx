import { PrototypeRoot, useStack } from '@proto/kit';
import { View } from '@vkontakte/vkui';
import { Agentation } from 'agentation';
import { HomePanel } from './screens/HomePanel';
import { DetailsPanel } from './screens/DetailsPanel';

export function App() {
  return (
    <>
      <PrototypeRoot target="mobile-app">
        <Flow />
      </PrototypeRoot>
      {/* Dev-only визуальный фидбек для агента (agentation): тулбар внизу справа,
          клик по элементу → структурный контекст (селектор/путь/стили). В prod-сборку
          не попадает (tree-shaking по import.meta.env.DEV). Выпилить = удалить импорт,
          эту строку и devDependency. */}
      {import.meta.env.DEV && <Agentation />}
    </>
  );
}

function Flow() {
  const stack = useStack('home');

  return (
    <View activePanel={stack.activePanel} history={stack.history} onSwipeBack={stack.back}>
      <HomePanel nav="home" onOpen={() => stack.push('details')} />
      <DetailsPanel nav="details" onBack={stack.back} />
    </View>
  );
}
