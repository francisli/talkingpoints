import React, {useState, useEffect} from 'react';
import {
  BrowserRouter as Router,
  Route,
  Link,
  NavLink,
  useParams
} from "react-router-dom";
import MiniSearch from 'minisearch';
import './App.scss';
import logo from './logo.png';
import Spinner from './Spinner';

function App() {
  const [data, setData] = useState(null);
  const [searchIndex, setSearchIndex] = useState<MiniSearch|null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetch('/api/data')
      .then(response => response.json())
      .then(data => {
        setData(data);
        const searchIndex = new MiniSearch({
          fields: ['topic'],
          storeFields: ['topic']
        });
        searchIndex.addAll(data);
        setSearchIndex(searchIndex);
      });
  }, []);

  return (
    <Router>
      <nav className="navbar navbar-light bg-light fixed-top">
        <div className="container">
          <Link to="/" className="navbar-brand">
            <img src={logo} className="logo" alt="Shahid Buttar Talking Points" />
          </Link>
          {searchIndex != null && (
            <Route path={["/:id", "/"]} children={<SearchForm searchQuery={searchQuery} onChange={setSearchQuery} />} />
          )}
        </div>
      </nav>
      <div className="container">
        {data == null ? (
          <Spinner />
        ) : (
          <div className="row">
            <Route path={["/:id", "/"]} children={<Topics data={data} searchIndex={searchIndex} searchQuery={searchQuery} />} />
            <main role="main" className="col-md-9">
              <Route path="/:id" children={<Content data={data} />} />
            </main>
          </div>
        )}
      </div>
    </Router>
  );
}

function SearchForm(props: any) {
  let { id } = useParams();
  let className = 'form-inline my-2 my-lg-0';
  if (id && id !== '') {
    className += ' d-none d-md-block';
  }
  return (
    <form className={className}>
      <input value={props.searchQuery} onChange={(event: React.ChangeEvent<HTMLInputElement>) => props.onChange(event.target.value)} className="form-control mr-sm-2" type="text" placeholder="Search..." aria-label="Search" />
    </form>
  );
}

function Topics(props: any) {
  let { id } = useParams();
  let className = 'topics col-md-3';
  if (id && id !== '') {
    className += ' d-none d-md-block';
  }
  const topics = []
  let results;
  if (props.searchQuery !== '') {
    results = props.searchIndex.search(props.searchQuery, {prefix: true, fuzzy: 0.2});
  } else if (props.data) {
    results = props.data;
  }
  for (let data of results) {
    topics.push(
      <li key={data.id} className="nav-item">
        <NavLink to={'/' + data.id} className="nav-link" activeClassName="active">{data.topic}</NavLink>
      </li>
    );
  }
  return (
    <nav className={className}>
      <ul className="nav flex-column">
        {topics}
      </ul>
    </nav>
  );
}

function Content(props: any) {
  let { id } = useParams();
  let header = null;
  let content = [];
  let index = parseInt(id || "-1");
  if (index >= 0) {
    let lines = props.data[index].content || "";
    lines = lines.split("\n");
    header = lines.shift();
    index = 0;
    for (let line of lines) {
      if (line !== "") {
        content.push(<p key={index}>{line}</p>);
        index += 1;
      }
    }
  }
  return (
    <div>
      <h1>{header}</h1>
      {content}
    </div>
  );
}

export default App;
