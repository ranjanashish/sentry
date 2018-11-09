import {Box, Flex} from 'grid-emotion';
import React from 'react';
import {Link, browserHistory} from 'react-router';

import {addErrorMessage} from 'app/actionCreators/indicator';
import AsyncView from 'app/views/asyncView';
import Button from 'app/components/button';
import {Client} from 'app/api';
import EmptyMessage from 'app/views/settings/components/emptyMessage';
import SentryAppAvatar from 'app/components/avatar/sentryAppAvatar';
import PropTypes from 'prop-types';
import {Panel, PanelItem, PanelBody, PanelHeader} from 'app/components/panels';
import SettingsPageHeader from 'app/views/settings/components/settingsPageHeader';
import {t} from 'app/locale';
import styled from 'react-emotion';
import space from 'app/styles/space';
import {withTheme} from 'emotion-theming';

const api = new Client();

class SentryApplicationRow extends React.PureComponent {
  static propTypes = {
    app: PropTypes.object.isRequired,
    orgId: PropTypes.string.isRequired,
  };

  redirectUrl = install => {
    const {orgId, app} = this.props;

    return app.redirectUrl
      ? `${app.redirectUrl}?installationId=${install.uuid}&code=${install.code}`
      : `/settings/${orgId}/integrations/`;
  };

  install = () => {
    const {orgId, app} = this.props;

    const success = install => browserHistory.push(this.redirectUrl(install));
    const error = err => addErrorMessage(err.responseJSON);

    const opts = {
      method: 'POST',
      data: {slug: app.slug},
      success,
      error,
    };

    api.request(`/organizations/${orgId}/sentry-app-installations/`, opts);
  };

  render() {
    let {app, orgId} = this.props;
    let btnClassName = 'btn btn-default';

    return (
      <SentryAppItem>
        <Flex>
          <SentryAppAvatar size={36} sentryApp={app} />
          <SentryAppBox>
            <SentryAppName>
              <StyledLink to={`/settings/${orgId}/developer-settings/${app.slug}/`}>
                {app.name}
              </StyledLink>
            </SentryAppName>
            <Status published={app.status === 'published'} />
          </SentryAppBox>
        </Flex>

        <StyledButtonGroup>
          <Box>
            <StyledInstallButton
              onClick={this.install}
              size="small"
              className="btn btn-default"
            >
              Install
            </StyledInstallButton>
          </Box>

          <Box>
            <Button
              icon="icon-trash"
              size="small"
              onClick={() => {}}
              className={btnClassName}
            />
          </Box>
        </StyledButtonGroup>
      </SentryAppItem>
    );
  }
}

export default class OrganizationDeveloperSettings extends AsyncView {
  getEndpoints() {
    let {orgId} = this.props.params;
    return [['applications', `/organizations/${orgId}/sentry-apps/`]];
  }

  renderBody() {
    let {orgId} = this.props.params;
    let action = (
      <Button
        priority="primary"
        size="small"
        to={`/settings/${orgId}/developer-settings/new/`}
        icon="icon-circle-add"
      >
        {t('Create New Application')}
      </Button>
    );

    let isEmpty = this.state.applications.length === 0;
    return (
      <div>
        <SettingsPageHeader title={t('Developer Settings')} action={action} />
        <Panel>
          <PanelHeader>{t('Applications')}</PanelHeader>
          <PanelBody>
            {!isEmpty ? (
              this.state.applications.map(app => {
                return <SentryApplicationRow key={app.uuid} app={app} orgId={orgId} />;
              })
            ) : (
              <EmptyMessage>{t('No applications have been created yet.')}</EmptyMessage>
            )}
          </PanelBody>
        </Panel>
      </div>
    );
  }
}

const StyledButtonGroup = styled(Flex)`
  align-items: center;
`;

const SentryAppItem = styled(PanelItem)`
  justify-content: space-between;
  padding: 15px;
`;

const SentryAppBox = styled(Box)`
  padding-left: 15px;
  flex: 1;
`;

const SentryAppName = styled('div')`
  margin-bottom: 3px;
`;

const StyledInstallButton = styled(
  withTheme(({...props}) => {
    return <Button {...props}>{t('Install')}</Button>;
  })
)`
  margin-right: 5px;
`;

const StyledLink = styled(Link)`
  font-size: 22px;
  color: ${props => props.theme.textColor};
`;

const Status = styled(
  withTheme(({published, ...props}) => {
    return (
      <Flex align="center">
        <div {...props}>{published ? t('published') : t('unpublished')}</div>
      </Flex>
    );
  })
)`
  color: ${props => (props.published ? props.theme.success : props.theme.gray2)};
  margin-left: ${space(0.5)};
  font-weight: light;
  margin-right: ${space(0.75)};
`;
