import { Group, Header, Panel, PanelHeader, SimpleCell } from '@vkontakte/vkui';
import { LikeButton } from '../components/LikeButton';

interface Props {
  nav: string;
  onOpenDetail: () => void;
}

export function FeedListPanel({ nav, onOpenDetail }: Props) {
  return (
    <Panel nav={nav}>
      <PanelHeader>Лента</PanelHeader>
      <Group header={<Header>Записи</Header>}>
        {[1, 2, 3].map((i) => (
          <SimpleCell
            key={i}
            onClick={onOpenDetail}
            subtitle="Нажмите, чтобы открыть детали"
            after={<LikeButton />}
          >
            Запись №{i}
          </SimpleCell>
        ))}
      </Group>
    </Panel>
  );
}
