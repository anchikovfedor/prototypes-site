import { Avatar, Button, Div, Group, Panel, PanelHeader, SimpleCell } from '@vkontakte/vkui';

interface Props {
  nav: string;
  onOpenModal: () => void;
}

export function ProfilePanel({ nav, onOpenModal }: Props) {
  return (
    <Panel nav={nav}>
      <PanelHeader>Профиль</PanelHeader>
      <Group>
        <SimpleCell before={<Avatar size={48} />} subtitle="@user">
          Имя Пользователя
        </SimpleCell>
      </Group>
      <Group>
        <Div>
          <Button size="l" stretched mode="secondary" onClick={onOpenModal}>
            Открыть модальную шторку
          </Button>
        </Div>
      </Group>
    </Panel>
  );
}
