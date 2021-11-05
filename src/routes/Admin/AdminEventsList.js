import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router';
import { connect } from 'react-redux';
import * as AdminActions from '../../modules/admin/actions';
import UserForm from './UserForm';
import './AdminEventsList.scss';
import { toast } from 'react-toastify';
import AdminEventListItem from './AdminEventListItem';
import { getEvents, eventsLoading, eventsError } from '../../modules/admin/selectors';
import { getSignupsArray, getSignupsArrayFormatted } from '../../utils/signupUtils';

/* Render the list container
*/
async function minDelay(func, ms = 1000) {
  const res = await Promise.all([func, new Promise(resolve => setTimeout(resolve, ms))]);
  return res[0];
}

class AdminEventList extends React.Component {
  static propTypes = {
    events: PropTypes.array.isRequired,
    updateEvents: PropTypes.func.isRequired,
  };

  constructor(props) {
    super(props);

    this.state = {
      userFormLoading: false,
    };

    this.onDeleteEvent = this.onDeleteEvent.bind(this);
    this.createUser = this.createUser.bind(this);
  }

  componentWillMount() {
    this.props.updateEvents();
  }

  onDeleteEvent(eventId) {
    if (window.confirm('Haluatko varmasti poistaa tämän tapahtuman? Tätä toimintoa ei voi perua. / Are you sure you want to delete this event? This cannot be undone.')) {
      this.props.deleteEvent(eventId)
        .then((success) => {
          if (!success) {
            console.alert('Poisto epäonnistui :c');
          }
          this.props.updateEvents();
        });
    }
  }

  createUser(email) {
    console.log(email);
    this.setState({
      userFormLoading: true,
    }, async () => {
      try {
        // TODO: better error handling
        const success = await minDelay(this.props.createUserAsync({ email }), 1000);
        if (success) {
          toast.success('Käyttäjän luominen onnistui / Successfully created account', { autoClose: 2000 });
        } else {
          toast.error('Käyttäjän luominen epäonnistui / Failed creating account', { autoClose: 2000 });
        }
      } catch (error) {
        console.log(error);
        toast.error('Käyttäjän luominen epäonnistui / Failed creating account', { autoClose: 2000 });
      }

      this.setState({ userFormLoading: false });
    });
  }

  onDeleteUser(userId) {

  }

  renderEventRows() {
    const { events } = this.props;
    return _.map(events.slice().reverse(), e => (
      <AdminEventListItem
        key={e.id}
        signups={_.sum(_.map(e.quota, q => q.signupCount))}
        data={e}
        onDelete={this.onDeleteEvent}
        />
      ));
  }

  render() {
    return (
      <div className="container">
        <h1>Hallinta / Management</h1>
        <table className="table">
          <thead>
            <tr>
              <th>Nimi / Name</th>
              <th>Ajankohta / Date</th>
              <th>Tila / Status</th>
              <th>Ilmoittautuneita / Participants</th>
              <th>Toiminnot / Actions</th>
            </tr>
          </thead>
          <tbody>
            {this.renderEventRows()}
          </tbody>
        </table>
        <Link to={`${PREFIX_URL}/admin/edit/new`} className="btn btn-default">
          + Uusi tapahtuma / New event
        </Link>
        <div>
          <Link to={`${PREFIX_URL}/admin/users`} className="btn btn-default">
            Käyttäjien hallintapaneeli / Account control panel
        </Link>
        </div>


      </div>
    );
  }
}

const mapDispatchToProps = {
  updateEvents: AdminActions.getEventsAsync,
  deleteEvent: AdminActions.deleteEventAsync,
  createUserAsync: AdminActions.createUserAsync,
};

const mapStateToProps = state => ({
  events: getEvents(state),
  eventsLoading: eventsLoading(state),
  eventsError: eventsError(state),
});

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(AdminEventList);
