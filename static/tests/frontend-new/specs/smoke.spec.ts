import {expect, test} from '@playwright/test';
import {getPadBody, goToNewPad} from 'ep_etherpad-lite/tests/frontend-new/helper/padHelper';

test.beforeEach(async ({page}) => {
  await goToNewPad(page);
});

test.describe('ep_chat_log_join_leave', () => {
  test('pad loads with plugin installed', async ({page}) => {
    const padBody = await getPadBody(page);
    await expect(padBody).toBeVisible();
  });

  // The join message should not be a <p>, so core / other-plugin tests
  // that strict-mode-locate `#chattext p` (the user's actual chat) don't
  // collide with the synthetic join entry. See change_user_color.spec.ts
  // upstream for the failure mode. Chat is collapsed by default, so the
  // entry isn't "visible" — assert presence instead.
  test('join entry is rendered as a <div>, not a <p>', async ({page}) => {
    await expect(page.locator('#chattext > div.ep_chat_log_join_leave-join'))
        .toHaveCount(1, {timeout: 30_000});
    await expect(page.locator('#chattext > p.ep_chat_log_join_leave-join')).toHaveCount(0);
  });
});
