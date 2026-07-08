import { Div, ModalPage, ModalPageHeader, Paragraph } from '@vkontakte/vkui';

interface Props {
  nav: string;
  onClose: () => void;
}

export function InfoModalPage({ nav, onClose }: Props) {
  return (
    <ModalPage nav={nav} onClose={onClose} header={<ModalPageHeader>Информация</ModalPageHeader>}>
      <Div>
        <Paragraph>
          Модальная шторка VKUI (ModalPage): снизу вверх на мобайле, по центру на десктопе.
          Закрывается свайпом вниз, по оверлею или кнопкой.
        </Paragraph>
      </Div>
    </ModalPage>
  );
}
