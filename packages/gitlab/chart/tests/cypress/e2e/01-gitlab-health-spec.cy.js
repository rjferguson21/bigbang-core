// Overrides from gluon commands.js
Cypress.Commands.add('deleteGitlabProject', (url, username, projectName) => {
  cy.visit(`${url}/${username}/${projectName}`, { failOnStatusCode: false })
  getCsrfToken().then((csrfToken) => {
    cy.request({
      method: 'DELETE',
      url: `${url}/${username}/${projectName}`,
      headers: { 'X-CSRF-Token': csrfToken },
      failOnStatusCode: false,
    }).then((response) => {
      expect([200, 202, 204, 302, 404]).to.include(response.status)
    })
  })
})

Cypress.Commands.overwrite('createGitlabProject', (originalFn, url, projectName) => {
  const username = getGitlabProjectOwner()

  cy.visit(url)
  getCsrfToken().then((csrfToken) => {
    cy.request({
      method: 'POST',
      url: `${url}/projects`,
      headers: { 'X-CSRF-Token': csrfToken },
      form: true,
      body: {
        'project[name]': projectName,
        'project[path]': projectName,
        'project[visibility_level]': '20',
      },
      failOnStatusCode: false,
    }).then((response) => {
      expect([200, 302]).to.include(response.status)
    })
  })

  cy.request({
    url: `${url}/${username}/${projectName}`,
    failOnStatusCode: false,
  }).its('status').should('eq', 200)
})

const getInput = (selector, options = {}) => {
  return cy.get(selector, options).then(($inputs) => {
    const $visibleInputs = $inputs.filter(':visible')
    return cy.wrap(($visibleInputs.length ? $visibleInputs : $inputs).first())
  })
}

const getCsrfToken = () => {
  return cy.get('meta[name="csrf-token"]').invoke('attr', 'content')
}

const getGitlabProjectOwner = () => {
  return Cypress.env('keycloak_test_enable')
    ? Cypress.env('tnr_username')
    : Cypress.env('gitlab_username')
}

const acceptKeycloakConsent = (keycloakUrl, appOrigin) => {
  for (let i = 0; i < 2; i++) {
    cy.url({ timeout: 30000 }).should('satisfy', (url) =>
      url.startsWith(appOrigin) || url.includes('required-action')
    ).then((url) => {
      if (url.includes('TERMS_AND_CONDITIONS')) {
        cy.origin(keycloakUrl, () => cy.get('#kc-accept').click())
      } else if (url.includes('OAUTH_GRANT')) {
        cy.origin(keycloakUrl, () => cy.get('#kc-login').click())
      }
    })
  }
  cy.url({ timeout: 30000 }).should('satisfy', (url) => url.startsWith(appOrigin))
}

const performKeycloakLogin = (keycloakUrl, appOrigin, username, password) => {
  cy.origin(keycloakUrl, { args: { username, password } }, ({ username, password }) => {
    cy.get('#username').type(username)
    cy.get('#password').type(password, { log: false })
    cy.get('#kc-login').click()
  })
  acceptKeycloakConsent(keycloakUrl, appOrigin)
}

const approveGitlabUser = (url, username) => {
  cy.visit(`${url}/admin/users/${username}`)
  cy.get('body').then(($body) => {
    if ($body.text().includes('Pending approval')) {
      getCsrfToken().then((csrfToken) => {
        cy.request({
          method: 'PUT',
          url: `${url}/admin/users/${username}/approve`,
          headers: { 'X-CSRF-Token': csrfToken },
          failOnStatusCode: false,
        }).then((response) => {
          expect([200, 201, 204, 302]).to.include(response.status)
        })
      })
    }
  })
}

const deleteGitlabUser = (url, username) => {
  cy.visit(`${url}/admin/users/${username}`, { failOnStatusCode: false })
  cy.get('body').then(($body) => {
    if (!$body.text().includes('404 - Not Found')) {
      getCsrfToken().then((csrfToken) => {
        cy.request({
          method: 'DELETE',
          url: `${url}/admin/users/${username}`,
          headers: { 'X-CSRF-Token': csrfToken },
          failOnStatusCode: false,
        }).then((response) => {
          expect([200, 202, 204, 302, 404]).to.include(response.status)
        })
      })
    }
  })
}

const setInputValue = (selector, value, options = {}) => {
  const { log = true, ...getOptions } = options

  return getInput(selector, getOptions).then(($input) => {
    if ($input.is(':visible')) {
      return cy.wrap($input)
        .clear({ force: true, log })
        .type(value, { force: true, log })
    }

    return cy.wrap($input, { log }).then(($hiddenInput) => {
      $hiddenInput.val(value)
      $hiddenInput.trigger('input')
      $hiddenInput.trigger('change')
    })
  })
}

const setSignupPasswordValue = (password) => {
  return getInput(gitlabSignupPasswordInputSelector).then(($input) => {
    const name = $input.attr('name') || $input.attr('data-name')
    const id = $input.attr('id') || $input.attr('data-id')

    if (name) {
      $input.attr('name', name)
    }

    if (id) {
      $input.attr('id', id)
    }

    if (!$input.attr('type')) {
      $input.attr('type', 'password')
    }

    return cy.wrap($input)
      .clear({ force: true, log: false })
      .type(password, { force: true, log: false })
  })
}

const submitGitlabLoginForm = () => {
  cy.get('body').then(($body) => {
    const $submitButtons = $body
      .find('button[data-testid="sign-in-button"], form#sign-in-form button[type="submit"]')
      .filter(':visible')

    if ($submitButtons.length) {
      cy.wrap($submitButtons.first()).click({ force: true })
    } else {
      cy.get('form[action="/users/sign_in"]').first().submit()
    }
  })
}

const assertGitlabAuthenticated = () => {
  cy.url({ timeout: 30000 }).should('not.include', '/users/sign_in')
  cy.get('body').should(($body) => {
    const hasAvatar = $body.find('[data-testid="user-avatar-content"]').length > 0
    const hasWelcomePage = $body.text().includes('Welcome to GitLab')
    const hasFirstProjectPage = $body.text().includes('Create your first project')
    const hasAdminNotices = $body.text().includes('Check the restrictions for new users') ||
      $body.text().includes('Web IDE single origin fallback is enabled')
    expect(hasAvatar || hasWelcomePage || hasFirstProjectPage || hasAdminNotices).to.be.true
  })
}

const gitlabLoginInputSelector = [
  'input[data-testid="username-field"]',
  'input[id="user_login"]',
  'input[name="user[login]"]',
].join(', ')

const gitlabPasswordInputSelector = [
  'input[data-testid="password-field"]',
  'input[id="user_password"]',
  'input[name="user[password]"]',
  'input[type="password"]',
].join(', ')

const gitlabSignupPasswordInputSelector = [
  'input[data-testid="new-user-password-field"]',
  'input[data-id="new_user_password"]',
  'input[data-name="new_user[password]"]',
  'input:not([type="hidden"])[id="new_user_password"]',
  'input:not([type="hidden"])[id="user_password"]',
  'input:not([type="hidden"])[name="user[password]"]',
  'input[type="password"]',
].join(', ')

Cypress.Commands.add('performGitlabLogin', (username, password) => {
  setInputValue(gitlabLoginInputSelector, username, { timeout: 30000 })
  setInputValue(gitlabPasswordInputSelector, password, { timeout: 30000, log: false })
  submitGitlabLoginForm()
})

Cypress.on('uncaught:exception', (err, runnable) => {
  // returning false here prevents Cypress from failing the test
  // gitlab throws this error in the console which by default fails the cypress test
  return false
})


describe('Gitlab Signup', () => {
  it('Check user is able to signup', () => {
    // test signup
    cy.visit(`${Cypress.env('url')}/users/sign_up`)

    cy.get('input[id="new_user_first_name"]').type(Cypress.env('gitlab_first_name'))
    cy.get('input[id="new_user_last_name"]').type(Cypress.env('gitlab_last_name'))

    //Listen for API call to validate username does not exist
    //cy.intercept('GET', '**/exists').as('userExistsCall')
    cy.get('input[id="new_user_username"]').type(Cypress.env('gitlab_username'))
    //cy.wait('@userExistsCall').then(({ response }) => {
    //  expect(response.body).to.deep.equal({ exists: false });
    //})

    cy.get('input[id="new_user_email"]').type(Cypress.env('gitlab_email'))

    cy.wait(3000) // wait 3 seconds for username check to complete
    // add user if not already created
    cy.get('body').then(($body) => {
      if ($body.find('.validation-error:not(.hide):visible').length === 0) {
        setSignupPasswordValue(Cypress.env('gitlab_password'))
        cy.get('button[data-testid="new-user-register-button"], button[type="submit"]')
          .first()
          .click({ force: true })
      }
    })

    //cy.get('input[id="new_user_password"]').type(Cypress.env('gitlab_password'))
    //cy.get('button[data-testid="new-user-register-button"]').click()

    //Validate redirect back to sign in and no errors occurred
    //cy.url().should('include', '/users/sign_in')
  })
})

describe('Gitlab Login as Root and Approve User', () => {
  it('Check admin is able to login', () => {
    // test login
    cy.visit(`${Cypress.env('url')}/users/sign_in`)
    cy.performGitlabLogin('root', Cypress.env('adminpassword'))

    // close welcome redesign popup if it exists
     cy.get('body').then($body => {
        if ($body.find('button[aria-label="Close"]').length) {
          cy.get('button[aria-label="Close"]').click()
        } else if ($body.find('button:contains("Get started")').length) {
          cy.contains('button', 'Get started').click()
        }
      })

    assertGitlabAuthenticated()

    // approve new user
    approveGitlabUser(Cypress.env('url'), Cypress.env('gitlab_username'))
  })
})

describe('Create Gitlab Project', () => {
  it('Check if KC SSO or Non-SSO user is able to create/delete a project', () => {

    // clear user data before starting test
    cy.clearAllUserData()

    // test login
    cy.visit(`${Cypress.env('url')}/users/sign_in`)
    if (Cypress.env('keycloak_test_enable')) {
      cy.get('form.js-omniauth-form button[data-testid="oidc-login-button"]', { timeout: 30000 }).click()
      performKeycloakLogin(
        Cypress.env('keycloak_url'),
        new URL(Cypress.env('url')).origin,
        Cypress.env('tnr_username'),
        Cypress.env('tnr_password')
      )
    } else {
      cy.performGitlabLogin(Cypress.env('gitlab_username'), Cypress.env('gitlab_password'))
    }

  // close welcome redesign popup if it exists
     cy.get('body').then($body => {
        if ($body.find('button[aria-label="Close"]').length) {
          cy.get('button[aria-label="Close"]').click()
        } else if ($body.find('button:contains("Get started")').length) {
          cy.contains('button', 'Get started').click()
        }
      })

    // if first login assign Developer role with the joining_team objective
    cy.url().then(($url) => {
      if ($url.includes('welcome')) {
        cy.get('select#user_role').select('software_developer')
        cy.get('select#user_registration_objective').select('code_storage')
        cy.get('button[type="submit"]').click()
      }
    })

    // If project does not exist, create it
    cy.get('body').then($body => {
      if ($body.find('.project-row').length === 0) {
        cy.createGitlabProject(Cypress.env('url'), Cypress.env('gitlab_project'))
      }
    })

    // Cleanup: delete the just-created gitlab project
    cy.deleteGitlabProject(Cypress.env('url'), getGitlabProjectOwner(), Cypress.env('gitlab_project'))
  })

  it('Login as Root and Delete Test User', () => {
   // clear user data before starting test
   cy.clearAllUserData()

   //Sign in as Root
   cy.visit(`${Cypress.env('url')}/users/sign_in`)
   cy.performGitlabLogin('root', Cypress.env('adminpassword'))

  // close welcome redesign popup if it exists
    cy.get('body').then($body => {
      if ($body.find('button[aria-label="Close"]').length) {
        cy.get('button[aria-label="Close"]').click()
      } else if ($body.find('button:contains("Get started")').length) {
        cy.contains('button', 'Get started').click()
      }
    })

   //Browse to created user and delete
   deleteGitlabUser(Cypress.env('url'), Cypress.env('gitlab_username'))
  })
})
