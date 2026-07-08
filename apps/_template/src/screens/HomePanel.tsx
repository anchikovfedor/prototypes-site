import { Button, Div, Group, Panel, PanelHeader, SimpleCell } from '@vkontakte/vkui';

interface Props {
  nav: string;
  onOpen: () => void;
}

export function HomePanel({ nav, onOpen }: Props) {
  return (
    <Panel nav={nav}>
      <PanelHeader>Главная</PanelHeader>
      <Group>
        <SimpleCell onClick={onOpen}>Первый пункт</SimpleCell>
        <SimpleCell onClick={onOpen}>Второй пункт</SimpleCell>
        <Div>
          <Button size="l" stretched onClick={onOpen}>
            Открыть детали
          </Button>
        </Div>
      </Group>
    </Panel>
  );
}
