import { useState } from 'react';
import {
  Epic,
  Group,
  ModalRoot,
  SimpleCell,
  SplitCol,
  SplitLayout,
  Tabbar,
  TabbarItem,
  Title,
  View,
  useAdaptivityConditionalRender,
} from '@vkontakte/vkui';
import { Icon28HomeOutline, Icon28UserCircleOutline } from '@vkontakte/icons';
import { useStack } from '@proto/kit';
import { FeedListPanel } from './screens/FeedListPanel';
import { FeedDetailPanel } from './screens/FeedDetailPanel';
import { ProfilePanel } from './screens/ProfilePanel';
import { InfoModalPage } from './modals/InfoModalPage';

type Story = 'feed' | 'profile';

export function AppContent() {
  const [story, setStory] = useState<Story>('feed');
  const feed = useStack('feed-list');
  const profile = useStack('profile-main');
  const [activeModal, setActiveModal] = useState<string | null>(null);
  const { viewWidth } = useAdaptivityConditionalRender();

  const openModal = () => setActiveModal('info');
  const closeModal = () => setActiveModal(null);

  const modal = (
    <ModalRoot activeModal={activeModal} onClose={closeModal}>
      <InfoModalPage nav="info" onClose={closeModal} />
    </ModalRoot>
  );

  const tabbar = (
    <Tabbar>
      <TabbarItem selected={story === 'feed'} onClick={() => setStory('feed')} label="Лента">
        <Icon28HomeOutline />
      </TabbarItem>
      <TabbarItem
        selected={story === 'profile'}
        onClick={() => setStory('profile')}
        label="Профиль"
      >
        <Icon28UserCircleOutline />
      </TabbarItem>
    </Tabbar>
  );

  return (
    <SplitLayout modal={modal}>
      {viewWidth.tabletPlus && (
        <SplitCol className={viewWidth.tabletPlus.className} fixed width={280} maxWidth={280}>
          <div style={{ padding: 16 }}>
            <Title level="2" style={{ marginBottom: 12 }}>
              Reference
            </Title>
            <Group>
              <SimpleCell onClick={() => setStory('feed')}>Лента</SimpleCell>
              <SimpleCell onClick={() => setStory('profile')}>Профиль</SimpleCell>
            </Group>
          </div>
        </SplitCol>
      )}

      <SplitCol width="100%" maxWidth={560} stretchedOnMobile autoSpaced>
        <Epic activeStory={story} tabbar={tabbar}>
          <View
            nav="feed"
            activePanel={feed.activePanel}
            history={feed.history}
            onSwipeBack={feed.back}
          >
            <FeedListPanel nav="feed-list" onOpenDetail={() => feed.push('feed-detail')} />
            <FeedDetailPanel nav="feed-detail" onBack={feed.back} onOpenModal={openModal} />
          </View>

          <View nav="profile" activePanel={profile.activePanel} history={profile.history}>
            <ProfilePanel nav="profile-main" onOpenModal={openModal} />
          </View>
        </Epic>
      </SplitCol>
    </SplitLayout>
  );
}
