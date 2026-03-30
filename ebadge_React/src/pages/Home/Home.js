import React, { useContext, useEffect, useState } from "react";
import axios from "../../utils/Api";
import "./Home.css";
import { Avatar } from "@mui/material";
import { getResource } from "../../utils/Api";
import AdminSidebar from "../../composant/layout/AdminSidebar/AdminSidebar";
import Role from "../../policies/Role";
import { AuthContext } from "../../context/AuthContext";

/**
 * Page d'accueil présentant des notifications.
 * @author Zacharie Nolet
 */
export default function Home() {
  const [notifications, setNotifications] = useState([]);
  const [loadingNotifications, setLoadingNotifications] = useState(true);

  const { user, loading: loadingAuth } = useContext(AuthContext);

  const showSidebar =
    user?.role === Role.Admin || user?.role === Role.Teacher;

  useEffect(() => {
    axios
      .get("/notification")
      .then((res) => {
        setNotifications(res.data);
        setLoadingNotifications(false);
      })
      .catch(() => {
        setLoadingNotifications(false);
      });
  }, []);

  const handleDelete = (id) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  if (loadingAuth) {
    return <div className="home-loading">Chargement...</div>;
  }

  return (
    <div className={`home ${showSidebar ? "home-with-sidebar" : "home-no-sidebar"}`}>

      {showSidebar && <AdminSidebar/>}

      <main className="home-main">
        <div className="home-content">
          <h2 className="home-title">Fil d'actualité</h2>

          {loadingNotifications ? (
            <div className="home-loading">Chargement...</div>
          ) : notifications.length === 0 ? (
            <div className="home-empty">Aucune actualité pour le moment.</div>
          ) : (
            <div className="feed">
              {notifications.map((notif) => (
                <NotificationCard
                  key={notif.id}
                  notif={notif}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

function NotificationCard({ notif, onDelete }) {
  const getMessage = () => {
    const name = notif.user
      ? `${notif.user.first_name} ${notif.user.last_name}`
      : "Inconnu";

    switch (notif.type) {
      case "badge_created":
        return `${name} a créé un badge`;
      case "badge_earned":
        return `${name} a gagné un badge`;
      case "ranking":
        return `${name} est maintenant ${notif.rank}${notif.rank === 1 ? "ère" : "ème"} position`;
      case "system_reset":
        return "L'administrateur a réinitialisé le système";
      default:
        return "Notification";
    }
  };

  const formatDate = (dateStr) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString("fr-CA");
  };

  const renderContent = () => {
    switch (notif.type) {
      case "badge_created":
        return (
          <div className="card-body card-center">
            <Avatar
              alt={notif.badge?.title}
              src={notif.badge?.imagePath || getResource("badge.png")}
              sx={{
                width: 100,
                height: 100,
                boxShadow: `0 0 8px 12px ${notif.badge?.categoryColor ?? "#ccc"}`,
              }}
            />
          </div>
        );

      case "badge_earned":
        return (
          <div className="card-body card-row">
            <Avatar
              alt={notif.user?.first_name}
              src={notif.user?.avatarImagePath || getResource("user.png")}
              sx={{ width: 80, height: 80 }}
            />
            <span className="card-dot">•</span>
            <Avatar
              alt={notif.badge?.title}
              src={notif.badge?.imagePath || getResource("badge.png")}
              sx={{
                width: 100,
                height: 100,
                boxShadow: `0 0 8px 12px ${notif.badge?.categoryColor ?? "#ccc"}`,
              }}
            />
          </div>
        );

      case "ranking":
        return (
          <div className="card-body card-center">
            <div className="card-avatar-wrapper card-avatar-large">
              <img
                src={notif.user?.avatarImagePath || getResource("user.png")}
                alt="user"
                className="card-avatar card-avatar-img-large"
              />
              <div className={`card-rank card-rank-${notif.rank}`}>
                #{notif.rank}
              </div>
            </div>
          </div>
        );

      case "system_reset":
        return (
          <div className="card-body card-center">
            <div className="card-reset-icon">↺</div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="card">
      <div className="card-header">
        <div className="card-header-info">
          <div>
            <p className="card-title">{getMessage()}</p>
            <p className="card-date">{formatDate(notif.created_at)}</p>
          </div>
        </div>

        <button
          className="card-close"
          onClick={() => onDelete(notif.id)}
        >
          ✕
        </button>
      </div>

      {renderContent()}
    </div>
  );
}