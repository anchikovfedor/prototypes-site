import { PrototypeRoot } from '@proto/kit';
import {
  Footnote,
  Group,
  Header,
  Panel,
  PanelHeader,
  SimpleCell,
  Badge,
  View,
} from '@vkontakte/vkui';
import { Icon28ChevronRightOutline } from '@vkontakte/icons';
import { prototypes } from './prototypes';

const TARGET_LABEL: Record<string, string> = {
  'desktop-web': 'Десктоп-веб',
  'mobile-app': 'Мобайл',
  adaptive: 'Адаптив',
};

export function App() {
  return (
    <PrototypeRoot target="desktop-web">
      <View activePanel="list">
        <Panel nav="list">
          <PanelHeader>Прототипы</PanelHeader>
          <Group header={<Header>Кликабельные прототипы</Header>}>
            {prototypes.map((p) => (
              <SimpleCell
                key={p.dir}
                href={`${import.meta.env.BASE_URL}${p.dir}/`}
                target="_blank"
                rel="noreferrer"
                subtitle={`${TARGET_LABEL[p.target]} · ${p.description}`}
                after={
                  <>
                    {p.status === 'wip' ? <Badge mode="prominent" /> : null}
                    <Icon28ChevronRightOutline />
                  </>
                }
              >
                {p.title}
              </SimpleCell>
            ))}
          </Group>
          <Group>
            <Footnote style={{ padding: '12px 16px', color: 'var(--vkui--color_text_secondary)' }}>
              Локально каждый прототип запускается отдельно:
              {' npm run dev -w apps/<dir>'}. Ссылки выше работают при совместном деплое.
            </Footnote>
          </Group>
        </Panel>
      </View>
    </PrototypeRoot>
  );
}
