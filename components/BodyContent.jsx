import React from 'react';
import config from 'config';
import paths from '../libs/paths';
import _ from 'lodash';

const BodyContent = ({ location, }) => {
  config.style && config.style();

  const allPages = paths.allPages();
  const page = paths.pageForPath(location.pathname, allPages);
  const section = getSection(page, location.pathname, allPages);

  // skip rendering body during dev, in that case it's up DevIndex
  // to take control of that
  const render = __DEV__ ? renderSection : renderBody;

  return render(
    page,
    {config, section, page, location},
    section
  );
};
BodyContent.propTypes = {
  location: React.PropTypes.object
};

function getSection(page, pathname, allPages) {
  const sectionName = page.section ? page.section : _.trim(pathname, '/');
  let section = config.paths[sectionName || '/'] || config.paths['/'] || {};

  section.title = section.title || sectionName;
  section.name = sectionName;

  // allow access to all or just part if needed
  section.pages = function(name) {
    return paths.getSectionPages(name || sectionName, allPages);
  };

  return section;
}

function renderBody(page, props, section) {
  let Body = config.layout();

  // ES6 tweak
  if(Body.default) {
    Body = Body.default;
  }

  return <Body {...props}>{renderSection(page, props, section)}</Body>
}

function renderSection(page, props, section) {
  // index doesn't have layouts
  if(!section.layouts) {
    return renderPage(page, props);
  }

  // sections don't have page metadata
  if(_.isEmpty(page)) {
    return React.createFactory(section.layouts['index']())(props);
  }

  // ok, got a page now. render it using a page template
  return React.createFactory(section.layouts['page']())(
    props,
    renderPage(page, props)
  );
}

function renderPage(page, props) {
  return _.isPlainObject(page) ? 'div' : React.createFactory(page)(props);
}

export default BodyContent;
