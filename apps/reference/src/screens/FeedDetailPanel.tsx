import {
  Button,
  Div,
  Group,
  Panel,
  PanelHeader,
  PanelHeaderBack,
  Placeholder,
} from '@vkontakte/vkui';
import { LikeButton } from '../components/LikeButton';

interface Props {
  nav: string;
  onBack: () => void;
  onOpenModal: () => void;
}

export function FeedDetailPanel({ nav, onBack, onOpenModal }: Props) {
  return (
    <Panel nav={nav}>
      <PanelHeader before={<PanelHeaderBack onClick={onBack} />} after={<LikeButton />}>
        Запись
      </PanelHeader>
      <Group>
        <Placeholder>Детали записи. Кнопка «назад» и свайп возвращают в ленту.</Placeholder>
        <Div>
          <Button size="l" stretched onClick={onOpenModal}>
            Открыть модальную шторку
          </Button>
        </Div>
      </Group>
    </Panel>
  );
}
