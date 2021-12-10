![Publish Status](https://github.com/ether/ep_chat_log_join_leave/workflows/Node.js%20Package/badge.svg) ![Backend Tests Status](https://github.com/ether/ep_chat_log_join_leave/workflows/Backend%20tests/badge.svg)

# ep_chat_log_join_leave

Etherpad plugin to log user joins and leaves in the chat history.

## Installation

```
npm install --no-save --legacy-peer-deps ep_chat_log_join_leave
```

or Use the Etherpad ``/admin`` interface.

## Testing

### Frontend Tests

After installing the plugin and starting Etherpad, visit
http://localhost:9001/tests/frontend/ to run the frontend tests.

### Backend Tests

From your Etherpad directory, type `cd src && npm run test` to run the backend
tests.

## Copyright and License

Copyright © the ep_chat_log_join_leave authors and contributors

Licensed under the [Apache License, Version 2.0](LICENSE) (the "License"); you
may not use this file except in compliance with the License. You may obtain a
copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed
under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR
CONDITIONS OF ANY KIND, either express or implied. See the License for the
specific language governing permissions and limitations under the License.
