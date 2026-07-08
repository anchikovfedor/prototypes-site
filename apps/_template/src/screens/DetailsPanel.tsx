import { Group, Panel, PanelHeader, PanelHeaderBack, Placeholder } from '@vkontakte/vkui';

interface Props {
  nav: string;
  onBack: () => void;
}

export function DetailsPanel({ nav, onBack }: Props) {
  return (
    <Panel nav={nav}>
      <PanelHeader before={<PanelHeaderBack onClick={onBack} />}>Детали</PanelHeader>
      <Group>
        <Placeholder>Экран деталей. Кнопка «назад» и свайп возвращают на главную.</Placeholder>
      </Group>
    </Panel>
  );
}
